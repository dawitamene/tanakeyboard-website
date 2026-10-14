/*
 * Latin -> Fidel transliteration, ported from the Addiyon Keyboard engine
 * (android/language/amharic/.../transliteration/Transliterator.kt and
 * AmharicTable.kt). Only the greedy reading and its simple alternates are
 * ported; keep the tables in sync with the app when its spellings change.
 * Parity is checked by tools/test-fidel.mjs.
 */
(function(root){
  'use strict';

  var BARE = 5, UA = -1, YA = -2, LAB_BASE = 10, LAB_WA = 2, LAB_WIE = 3, LAB_BARE = 4;

  function fam(forms, ua, labialized, ya){
    return { forms: forms, ua: ua || null, labialized: labialized || null, ya: ya || null };
  }

  var base = {
    'h': fam('ሀሁሂሃሄህሆ', 'ሗ'),
    'H': fam('ሐሑሒሓሔሕሖ'),
    'l': fam('ለሉሊላሌልሎ', 'ሏ'),
    'm': fam('መሙሚማሜምሞ', 'ሟ', null, 'ፙ'),
    's': fam('ሰሱሲሳሴስሶ', 'ሷ'),
    'S': fam('ሠሡሢሣሤሥሦ', 'ሧ'),
    'sh': fam('ሸሹሺሻሼሽሾ', 'ሿ'),
    'r': fam('ረሩሪራሬርሮ', 'ሯ', null, 'ፘ'),
    'q': fam('ቀቁቂቃቄቅቆ', 'ቋ', 'ቈቊቋቌቍ'),
    'Q': fam('ቐቑቒቓቔቕቖ', 'ቛ', 'ቘቚቛቜቝ'),
    'b': fam('በቡቢባቤብቦ', 'ቧ'),
    'v': fam('ቨቩቪቫቬቭቮ', 'ቯ'),
    't': fam('ተቱቲታቴትቶ', 'ቷ'),
    'ch': fam('ቸቹቺቻቼችቾ', 'ቿ'),
    'n': fam('ነኑኒናኔንኖ', 'ኗ'),
    'gn': fam('ኘኙኚኛኜኝኞ', 'ኟ'),
    "'": fam('አኡኢኣኤእኦ'),
    'k': fam('ከኩኪካኬክኮ', 'ኳ', 'ኰኲኳኴኵ'),
    'kh': fam('ኸኹኺኻኼኽኾ', 'ዃ', 'ዀዂዃዄዅ'),
    'w': fam('ወዉዊዋዌውዎ'),
    '`': fam('ዐዑዒዓዔዕዖ'),
    'z': fam('ዘዙዚዛዜዝዞ', 'ዟ'),
    'zh': fam('ዠዡዢዣዤዥዦ', 'ዧ'),
    'y': fam('የዩዪያዬይዮ'),
    'd': fam('ደዱዲዳዴድዶ', 'ዷ'),
    'j': fam('ጀጁጂጃጄጅጆ', 'ጇ'),
    'g': fam('ገጉጊጋጌግጎ', 'ጓ', 'ጐጒጓጔጕ'),
    'T': fam('ጠጡጢጣጤጥጦ', 'ጧ'),
    'ts': fam('ጸጹጺጻጼጽጾ', 'ጿ'),
    'Ts': fam('ፀፁፂፃፄፅፆ', 'ፇ'),
    'C': fam('ጨጩጪጫጬጭጮ', 'ጯ'),
    'ph': fam('ጰጱጲጳጴጵጶ', 'ጷ'),
    'P': fam('ጰጱጲጳጴጵጶ', 'ጷ'),
    'f': fam('ፈፉፊፋፌፍፎ', 'ፏ', null, 'ፚ'),
    'p': fam('ፐፑፒፓፔፕፖ', 'ፗ')
  };
  var families = {};
  Object.keys(base).forEach(function(k){ families[k] = base[k]; });
  families.x = base.sh;
  families.c = base.ch;
  families.N = base.gn;

  var velarH = fam('ኀኁኂኃኄኅኆ', 'ኋ', 'ኈኊኋኌኍ');
  var alternates = {
    'h': [velarH, families.H], 'H': [velarH, families.h],
    's': [families.S], 'S': [families.s],
    'ts': [families.Ts], 'Ts': [families.ts],
    'k': [families.q], 't': [families.T],
    'c': [families.C], 'C': [families.ch],
    'p': [families.P], 'P': [families.p]
  };

  var consonants = Object.keys(families).sort(function(a, b){ return b.length - a.length; });

  var vowels = [['ie', 4], ['ua', UA], ['e', 0], ['u', 1], ['i', 2], ['a', 3], ['o', 6]];
  var vowelAlternates = { 'e': [4] };
  var consonantVowelAlternates = { 'h|a': [0] };

  var labializedVowels = [
    ['Wie', LAB_BASE + LAB_WIE], ['WIE', LAB_BASE + LAB_WIE], ['WE', LAB_BASE + LAB_WIE],
    ['We', LAB_BASE + 0], ['Wi', LAB_BASE + 1], ['WI', LAB_BASE + 1],
    ['Wa', LAB_BASE + LAB_WA], ['WA', LAB_BASE + LAB_WA]
  ];
  var bareLabialized = ['W', LAB_BASE + LAB_BARE];
  var labializedFallbackW = [0, 2, 3, 4, BARE];
  var yaSpellings = ['Ya', 'YA'];

  var bareVowels = [
    ['ie', "'", 4], ['a', "'", 0], ['i', "'", 2], ['u', "'", 1], ['o', "'", 6], ['e', "'", BARE],
    ['A', '`', 0], ['I', '`', 2], ['U', '`', 1], ['O', '`', 6], ['E', '`', BARE]
  ];
  var punctuation = { ',': '፣', '.': '።', '?': '፧' };

  function startsAt(s, prefix, i, ignoreCase){
    var part = s.substr(i, prefix.length);
    if(part.length !== prefix.length) return false;
    return ignoreCase ? part.toLowerCase() === prefix.toLowerCase() : part === prefix;
  }

  function matchConsonant(latin, i){
    for(var a = 0; a < consonants.length; a++) if(startsAt(latin, consonants[a], i, false)) return consonants[a];
    for(var b = 0; b < consonants.length; b++) if(startsAt(latin, consonants[b], i, true)) return consonants[b];
    return null;
  }

  function labializedForm(family, position){
    if(position === LAB_WA) return family.ua;
    return family.labialized ? (family.labialized.charAt(position) || null) : null;
  }

  function startsWithVowel(latin, i){
    return vowels.some(function(v){ return startsAt(latin, v[0], i, true); });
  }

  function labializedVowelAt(latin, i, family){
    if(latin.charAt(i) !== 'W') return null;
    var match = null;
    for(var a = 0; a < labializedVowels.length; a++){
      if(startsAt(latin, labializedVowels[a][0], i, false)){ match = labializedVowels[a]; break; }
    }
    if(!match && !startsWithVowel(latin, i + 1)) match = bareLabialized;
    if(!match) return null;
    return labializedForm(family, match[1] - LAB_BASE) ? match : null;
  }

  function yaSpellingAt(latin, i, family){
    if(!family.ya || latin.charAt(i) !== 'Y') return null;
    for(var a = 0; a < yaSpellings.length; a++) if(startsAt(latin, yaSpellings[a], i, false)) return yaSpellings[a];
    return null;
  }

  var uaFallbackCache = null, yaFallbackCache = null;
  function renderFamily(family, index){
    if(index === null) return family.forms.charAt(BARE);
    if(index === UA){
      if(family.ua) return family.ua;
      return family.forms.charAt(BARE) + (uaFallbackCache || (uaFallbackCache = transliterate('ua')));
    }
    if(index === YA){
      if(family.ya) return family.ya;
      return family.forms.charAt(BARE) + (yaFallbackCache || (yaFallbackCache = transliterate('ya')));
    }
    var position = index - LAB_BASE;
    if(position < 0 || position > LAB_BARE) return family.forms.charAt(index);
    return labializedForm(family, position) ||
      (family.forms.charAt(BARE) + families.w.forms.charAt(labializedFallbackW[position]));
  }

  function consonantUnit(latin, i, consonant){
    var end = i + consonant.length;
    var famList = [families[consonant]].concat(alternates[consonant] || []);
    var primary = famList[0];
    var index = null, altIndices = [];
    var labialized = labializedVowelAt(latin, end, primary);
    var ya = labialized ? null : yaSpellingAt(latin, end, primary);
    if(ya){
      end += ya.length; index = YA;
    } else if(labialized){
      end += labialized[0].length; index = labialized[1];
      altIndices = labialized[1] === LAB_BASE ? [LAB_BASE + LAB_WIE] : [];
    } else {
      for(var a = 0; a < vowels.length; a++){
        if(startsAt(latin, vowels[a][0], end, true)){
          index = vowels[a][1];
          altIndices = consonantVowelAlternates[consonant + '|' + vowels[a][0]] || vowelAlternates[vowels[a][0]] || [];
          end += vowels[a][0].length;
          break;
        }
      }
    }
    return {
      length: end - i,
      text: renderFamily(primary, index),
      vowelFlip: altIndices.length ? renderFamily(primary, altIndices[0]) : null,
      consonantFlip: famList[1] ? renderFamily(famList[1], index) : null
    };
  }

  function bareVowelUnit(latin, i){
    var match = null;
    for(var a = 0; a < bareVowels.length && !match; a++) if(startsAt(latin, bareVowels[a][0], i, false)) match = bareVowels[a];
    for(var b = 0; b < bareVowels.length && !match; b++) if(startsAt(latin, bareVowels[b][0], i, true)) match = bareVowels[b];
    if(!match) return null;
    var family = families[match[1]];
    var other = match[1] === "'" ? families['`'] : families["'"];
    return {
      length: match[0].length,
      text: family.forms.charAt(match[2]),
      vowelFlip: null,
      consonantFlip: other.forms.charAt(match[2])
    };
  }

  function unitAt(latin, i){
    var consonant = matchConsonant(latin, i);
    if(consonant) return consonantUnit(latin, i, consonant);
    var vowel = bareVowelUnit(latin, i);
    if(vowel) return vowel;
    var ch = latin.charAt(i);
    return { length: 1, text: punctuation[ch] || ch, vowelFlip: null, consonantFlip: null };
  }

  function units(latin){
    var out = [], i = 0;
    while(i < latin.length){
      var unit = unitAt(latin, i);
      out.push(unit);
      i += unit.length;
    }
    return out;
  }

  function transliterate(latin){
    return units(latin).map(function(u){ return u.text; }).join('');
  }

  function flipped(list, key){
    var changed = false;
    var text = list.map(function(u){
      if(u[key]){ changed = true; return u[key]; }
      return u.text;
    }).join('');
    return changed ? text : null;
  }

  /* The greedy reading first, then the "e as ie" and "other consonant family" readings. */
  function readings(latin){
    var list = units(latin);
    var seen = {};
    return [list.map(function(u){ return u.text; }).join(''), flipped(list, 'vowelFlip'), flipped(list, 'consonantFlip')]
      .filter(function(text){
        if(!text || seen[text]) return false;
        seen[text] = true;
        return true;
      });
  }

  var ONES = '፩፪፫፬፭፮፯፰፱', TENS = '፲፳፴፵፶፷፸፹፺';

  /* Arabic digits -> Ge'ez numerals, ported from GeezNumerals.kt. */
  function toGeez(digits){
    digits = String(digits);
    if(!/^[0-9]{1,12}$/.test(digits)) return null;
    var significant = digits.replace(/^0+/, '');
    if(!significant) return null;
    var padded = significant.length % 2 === 0 ? significant : '0' + significant;
    var groups = padded.length / 2, out = '';
    for(var g = 0; g < groups; g++){
      var tens = +padded.charAt(g * 2), ones = +padded.charAt(g * 2 + 1);
      var position = groups - 1 - g;
      var omitOne = tens * 10 + ones === 1 && position > 0 && (position % 2 === 1 || g === 0);
      if(!omitOne){
        if(tens > 0) out += TENS.charAt(tens - 1);
        if(ones > 0) out += ONES.charAt(ones - 1);
      }
      if(position > 0){
        if(position % 2 === 1){ if(tens + ones > 0) out += '፻'; }
        else out += '፼';
      }
    }
    return out;
  }

  var api = { transliterate: transliterate, readings: readings, toGeez: toGeez, families: families };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Fidel = api;
})(this);
