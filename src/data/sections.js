
var sections = [
  {
    id: 'header',
    topMultiple: -0.2,
    bottomMultiple: 1,
    vizTopMultiple: 0.05,
    vizAlign: 'right',
    vizType: 'image',
    style: {
      width: '45%',
      top: 0,
      marginBottom: '75vh',
      margin: 20,
      padding: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
    },
    text: `
<center>
  <h1>
    An Interactive Visualization of<br />
    Every Line in Hamilton
  </h1>
  <sup>BY [SHIRLEY WU](http://twitter.com/sxywu)</sup>
</center>

The [hype](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=hamilton%20hype) around [Hamilton](http://www.hamiltonbroadway.com/) is astronomical, so I was understandably doubtful at first.  But from the moment I sat down to listen the whole way through, I was done for.

I was obsessed.  I had the soundtrack on repeat for months, it was all I listened to in my waking hours.  I listened so much I had favorite lines and favorite songs.  I analyzed the lyrics; I reveled in the layers of complexity, the double entredres, the clever word plays.

Then my obsession hit a peak and <span style='font-size: 16px'>**I started to wonder what a visualization of Hamilton would look like.**</span>

<center>
  <h3>
    Start<br />
    ↓
  </h3>
</center>
    `
  },
  {
    id: 'intro1',
    vizType: 'random',
    style: {
      margin: 'auto',
      marginTop: '100vh',
      width: '50%',
    },
    text: `
When I started, I was curious about two things: the relationships between the primary characters, and the recurring phrases associated with those characters.

So I've gone through every single line in Hamilton (twice 😱) to record who sang each line, as well as who that line may have been directed towards.  I've also noted every phrase that was sung more than once across more than one song, and grouped them into broad themes*.

<sup>**Though I am unconscious of intentional error, I am nevertheless too sensible of my defects not to think it probable that I may have committed many errors.*</sup>
    `
  },

  {
    id: 'filter_characters',
    vizAlign: 'right',
    vizType: 'song',
    style: {
      marginTop: '100vh',
    },
    text: `
After three days, I had a spectacularly rich dataset of lines, characters, and recurring phrases.  The first thing I did was to explore the lines filtered by characters and their conversations.

Below are **12** of the **18** primary characters with Hamilton at the center.  They are connected by **arcs** denoting the conversations between them.  <span class='underline'>Select any set of characters and conversations</span> to view their corresponding lines.
    `
  },
];

export default sections;
