var fs = require('fs');
var converter = require("csvtojson").Converter;
var _ = require('lodash');

var convert = new converter({});
var allCharacters = {}; // first keyed by character/theme/word
var allThemes = {}; // then keyed by song
var allWords = {}; // finally keyed by line number
convert.fromFile('data/meta/characters.csv', function(err, characters) {
  // convert.fromFile('data/meta/themes.csv', function(err, themes) {
    // now that we have characters and themes, load song file
    var data = [];
    var songNum = 1;
    var themeIndex = 0;
    var charIndex = 0;

    var start = _.split(characters[charIndex].lines, '-');
    var end = parseInt(start[1]);
    start = parseInt(start[0]);

    fs.readFile('processed/' + songNum + '.json', function(err, lines) {
      lines = JSON.parse(lines);
      _.each(lines, function(line, lineNum) {
        // if song number matches, and line number is within start and end
        // or if we don't have an end, but the start matches
        // add the character data into the line data
        if (songNum === characters[charIndex].song &&
          ((lineNum >= start && lineNum <= end) ||
          (!end && lineNum === start))) {
          line.push({
            characters: _.split(characters[charIndex].characters, '/'),
            excluding: _.split(characters[charIndex].excluding, '/'),
            conversing: _.split(characters[charIndex].directed_to, '/')
          });
          data.push(line);

          // if lineNum is same as end,
          // or if there is no end, but start matches
          // move on to next character
          if ((lineNum === end) ||
            (!end && lineNum === start)) {
            charIndex += 1;
            start = _.split(characters[charIndex].lines, '-');
            end = parseInt(start[1]);
            start = parseInt(start[0]);
          }
        }
      });
    });
  // });
});
