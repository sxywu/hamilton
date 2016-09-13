var fs = require('fs');
var converter = require("csvtojson").Converter;
var converter = require("csvtojson").Converter;
var _ = require('lodash');
var d3 = require('d3');

var converter1 = new converter({});
var converter2 = new converter({});
var allCharacters = {characters: {}, excluding: {}, conversing: {}};
var allThemes = {};
var allWords = {};

// loaded data
var data = []; // characters, themes
var indices = [0, 0];
var prepositions = [];
var final = [];

function matchMetaToLyric(songNum, lineNum, type) {
  var meta = data[type];
  var index = indices[type];
  var start = _.split(meta[index].lines, '-');
  var end = parseInt(start[1]);
  start = parseInt(start[0]);
  var matched;
  // if song number matches, and line number is within start and end
  // or if we don't have an end, but the start matches
  // add the character data into the line data
  if (songNum === meta[index].song &&
    ((lineNum >= start && lineNum <= end) ||
    (!end && lineNum === start))) {
    matched = meta[index];
    // if lineNum is same as end,
    // or if there is no end, but start matches
    // move on to next character
    if ((lineNum === end) ||
      (!end && lineNum === start)) {
      indices[type] += 1;
    }
  }
  return matched;
}

function keyByLine(obj, keys, line) {
  _.each(keys, function(key) {
    if (!obj[key]) {
      obj[key] = [];
    }
    obj[key].push(line);
  });
}

function saveData() {
  // first save final data
  fs.writeFile('final/lines.json', JSON.stringify(final));
  fs.writeFile('final/characters.json', JSON.stringify(allCharacters));
  fs.writeFile('final/themes.json', JSON.stringify(allThemes));
  fs.writeFile('final/words.json', JSON.stringify(allWords));
}

function parseSong(songNum) {
  if (songNum > 46) {
    saveData();
    return;
  }
  console.log(songNum)
  fs.readFile('processed/' + songNum + '.json', function(err, lines) {
    lines = JSON.parse(lines);
    _.each(lines, function(line, lineNum) {
      lineNum += 1;
      var character = matchMetaToLyric(songNum, lineNum, 0);
      var theme = matchMetaToLyric(songNum, lineNum, 1);

      console.log('      ' + lineNum)
      var lineFinal = [
        songNum + '-' + lineNum,
        line[0],
        [
          _.split(character.characters, '/'),
          _.split(character.excluding, '/'),
          _.split(character.directed_to, '/')
        ],
        theme && [
          _.split(theme.themes, '/'),
          theme.notes
        ]
      ];
      final.push(lineFinal);

      // save lines by character
      keyByLine(allCharacters.characters, lineFinal[2][0], lineFinal[0]);
      keyByLine(allCharacters.excluding, lineFinal[2][1], lineFinal[0]);
      var conversing = _.chain(lineFinal[2][0])
        .map(function(source) {
          return _.map(lineFinal[2][2], function(target) {
            if (!target) return;
            return source + '-' + target
          });
        }).flatten().filter().value();
      keyByLine(allCharacters.conversing, conversing, lineFinal[0]);
      // and by themes if any exists
      theme && keyByLine(allThemes, lineFinal[3][0], lineFinal[0]);
      // and finally by words (filter out prepositions)
      var words = _.chain(lineFinal[1].replace(/[^a-zA-Z\'\’]/g, ' ').split(' '))
        .map(function(word) {return word.toLowerCase()})
        .uniq().reject(function(word) {
          return _.includes(prepositions, word);
        }).value();
      keyByLine(allWords, words, lineFinal[0]);
    });

    // go to next song
    parseSong(songNum + 1);
  });
}

converter2.on("end_parsed", function (themes) {
  data.push(themes);
  fs.readFile('data/prepositions.txt', 'utf8', function(err, prep) {
    prepositions = prep.split('\n');
    parseSong(1);
  });
});

converter1.on("end_parsed", function (characters) {
  data.push(characters);
  require("fs").createReadStream("data/meta/themes.csv").pipe(converter2);
});
require("fs").createReadStream("data/meta/characters.csv").pipe(converter1);
