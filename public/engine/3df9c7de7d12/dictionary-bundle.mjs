// A lossless text form of the Amharic dictionary database: its schema, header pragmas and every
// row of every table. It compresses far better than the SQLite file (no indexes, no page slack),
// and buildDatabase() turns it back into the same database with sql.js.
//
// Format, one record per line, fields separated by tabs:
//   ADDIYON-DICT\t1
//   P\t<pragma>\t<value>                 header pragma (user_version, application_id)
//   S\t<sql>                             a CREATE TABLE statement
//   T\t<table>\t<columns>\t<rows>        followed by exactly <rows> rows of <table>
//   <value>\t<value>...                   one row; \N is NULL, other values are escaped text
//   I\t<sql>                             a CREATE INDEX statement, run after all rows
// Values are inserted as text so each column's declared affinity stores them exactly as before.

const MAGIC = 'ADDIYON-DICT\t1';
const PRAGMAS = ['user_version', 'application_id'];

function escapeValue(value) {
  if (value === null || value === undefined) return '\\N';
  return String(value).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

function unescapeValue(field) {
  if (field === '\\N') return null;
  if (field.indexOf('\\') < 0) return field;
  return field.replace(/\\(.)/g, (_, code) => (code === 't' ? '\t' : code === 'n' ? '\n' : code === 'r' ? '\r' : code));
}

function queryAll(database, sql) {
  const statement = database.prepare(sql);
  const rows = [];
  try {
    while (statement.step()) rows.push(statement.get());
  } finally {
    statement.free();
  }
  return rows;
}

export function encodeBundle(database) {
  const lines = [MAGIC];
  for (const pragma of PRAGMAS) lines.push(`P\t${pragma}\t${queryAll(database, `PRAGMA ${pragma}`)[0][0]}`);
  const tables = queryAll(database, "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid");
  for (const [, sql] of tables) lines.push(`S\t${escapeValue(sql)}`);
  for (const [name] of tables) {
    const columns = queryAll(database, `PRAGMA table_info("${name}")`).length;
    const rows = queryAll(database, `SELECT * FROM "${name}"`);
    lines.push(`T\t${name}\t${columns}\t${rows.length}`);
    for (const row of rows) lines.push(row.map(escapeValue).join('\t'));
  }
  for (const [sql] of queryAll(database, "SELECT sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL ORDER BY rowid")) {
    lines.push(`I\t${escapeValue(sql)}`);
  }
  return new TextEncoder().encode(`${lines.join('\n')}\n`);
}

export function buildDatabase(SQL, bundleBytes) {
  const text = new TextDecoder().decode(bundleBytes);
  const lines = text.split('\n');
  if (lines[0] !== MAGIC) throw new Error('Not an Addiyon dictionary bundle');
  const database = new SQL.Database();
  database.exec('PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF; BEGIN');
  const indexes = [];
  try {
    let i = 1;
    while (i < lines.length) {
      const fields = lines[i++].split('\t');
      switch (fields[0]) {
        case '':
          break;
        case 'P':
          if (!/^[a-z_]+$/.test(fields[1])) throw new Error(`Bad pragma ${fields[1]}`);
          database.exec(`PRAGMA ${fields[1]} = ${Number(fields[2])}`);
          break;
        case 'S':
          database.exec(unescapeValue(fields[1]));
          break;
        case 'T': {
          const columns = Number(fields[2]);
          const rows = Number(fields[3]);
          const insert = database.prepare(`INSERT INTO "${fields[1]}" VALUES (${new Array(columns).fill('?').join(',')})`);
          try {
            for (let row = 0; row < rows; row++) {
              const values = lines[i++].split('\t');
              if (values.length !== columns) throw new Error(`${fields[1]} row ${row} has ${values.length} values, expected ${columns}`);
              insert.run(values.map(unescapeValue));
            }
          } finally {
            insert.free();
          }
          break;
        }
        case 'I':
          indexes.push(unescapeValue(fields[1]));
          break;
        default:
          throw new Error(`Unknown bundle record on line ${i}`);
      }
    }
    database.exec('COMMIT');
    for (const sql of indexes) database.exec(sql);
  } catch (error) {
    database.close();
    throw error;
  }
  return database;
}
