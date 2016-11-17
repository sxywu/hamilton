
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
  <h1 style='line-height: 1.25'>
    An Interactive Visualization of<br />
    Every Line in Hamilton
  </h1>
  <sup>BY [SHIRLEY WU](http://twitter.com/sxywu)</sup>
</center>

The [hype](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=hamilton%20hype) around [Hamilton](http://www.hamiltonbroadway.com/) is astronomical, so I was understandably doubtful at first.  But from the moment I sat down to listen the whole way through, I was done for.

I was obsessed.  I had the soundtrack on repeat for months, it was all I listened to in my waking hours.  I listened so much I had favorite lines and favorite songs.  I analyzed the lyrics; I reveled in the layers of complexity, the double entredres, the clever word plays.

Then my obsession hit a peak and <span class='underline'>I started to wonder what a visualization of Hamilton would look like.</span>

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

So I've gone through every single line in Hamilton (twice 😱) to record who sang each line, as well as who that line may have been directed towards.  I've noted every phrase that was sung more than once across more than one song, and grouped them into broad themes*.

I've visualized the lines as circles, colored by singer.  <span class='underline'>Hover any circle</span> to see its lyrics.

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
  {
    id: 'angelica1',
    vizAlign: 'left',
    vizType: 'line',
    style: {
      marginTop: '100vh',
    },
    text: `
As I filtered by different sets of characters, I started to see the nuances, the stories between each set of characters.  The most widely analyzed relationship is the one between Alexander Hamilton and Aaron Burr, but I want to explore instead the relationship between Alexander and Angelica Schuyler.
    `
  },
  {
    id: 'angelica2',
    vizAlign: 'left',
    vizType: 'line',
    style: {
      marginTop: '20vh',
    },
    clips: [
      ['/music/whenyouregone.mp3', ['8/26:23-27', '2/26:23-27']],
      ['/music/whenyouregone.mp3', ['8/26:85-86', '2/26:85-86']],
    ],
    text: `
### An Ocean Away

Angelica Schuyler is Alexander Hamilton's sister-in-law, the one who introduces Alexander to her sister Eliza Schuyler.  Angelica and Alexander's relationship is ambiguously flirtateous from the very start, their exchanges in *Satisfied* puntuated by mutual understanding - that they're both never satisfied.

This flirtation is amplified in *Take A Break*, the only time in the whole musical they sing together:

<span class='music' data-char='2' data-clip='0'>
  <span class='control'></span>
  And there you are, an ocean away &nbsp;<br />
  &nbsp; Do you have to live an ocean away? &nbsp;<br />
  &nbsp; Thoughts of you subside &nbsp;<br />
  &nbsp; Then I get another letter &nbsp;<br />
  &nbsp; I cannot put the notion away… &nbsp;<br />
</span>

Angelica sings that she's coming home from London for the summer (at Eliza's invitation), and that she just can't wait:

<span class='music' data-char='8' data-clip='1'>
  <span class='control'></span>
  You won’t be an ocean away &nbsp;<br />
  &nbsp; You will only be a moment away… &nbsp;<br />
</span>

And they leave us wondering: did they, or didn't they?
    `
  },
  {
    id: 'angelica3',
    vizAlign: 'left',
    vizType: 'line',
    style: {
      marginTop: '20vh',
    },
    clips: [
      ['/music/whenyouregone.mp3', ['2/37:32-33']],
      ['/music/whenyouregone.mp3', ['8/37:36-43']],
      ['/music/whenyouregone.mp3', ['8/11:92-111']],
    ],
    text: `
### As Trusting Or As Kind

The turning point in Angelica and Alexander's relationship comes in *The Reynolds Pamphlet*, after Alexander publishes the details of his affair with Maria Reynolds to save his political reputation.  When Angelica hurries back from London, Alexander is relieved:

<span class='music' data-char='2' data-clip='0'>
  <span class='control'></span>
  Angelica, thank God &nbsp;<br />
  &nbsp; Someone who understands what I’m struggling here to do &nbsp;<br />
</span>

Angelica instead replies:

<span class='music' data-char='8' data-clip='1'>
  <span class='control'></span>
  &nbsp; I know my sister like I know my own mind &nbsp;<br />
  &nbsp; You will never find anyone as trusting or as kind &nbsp;<br />
  &nbsp; I love my sister more than anything in this life &nbsp;<br />
  &nbsp; I will choose her happiness over mine every time &nbsp;<br />
  &nbsp; Put what we had aside &nbsp;<br />
  &nbsp; I’m standing at her side &nbsp;<br />
  &nbsp; You could never be satisfied &nbsp;<br />
  &nbsp; God, I hope you’re satisfied &nbsp;<br />
</span>

And here we see that Angelica has matured; when she first introduces Eliza to Alexander, she does so because she knows Eliza is in love with him.  She believes that Eliza (*you will never find anyone as trusting or as kind*) is a better match for Alexander.  But most of all, she does so for herself, because she knows:
<span class='music' data-char='8' data-clip='1'><span class='control'></span>He will never be satisfied, I will never be satisfied </span>.

But after the Reynolds affair, she *puts what they had aside*, and we know that she does this solely for Eliza's sake; she sings only that Alexander could never be satisfied.
    `
  },
  {
    id: 'angelica4',
    vizAlign: 'left',
    vizType: 'line',
    style: {
      marginTop: '20vh',
    },
    text: `
### She Takes His Hand

*It's Quiet Uptown* is the only song that starts with Angelica, as she narrates the aftermath of the Hamiltons losing their eldest son.  Angelica watches over as Alexander tries to get through to an unmoving Eliza, and as they reconcile; it is the most beautifully satisfying close to Angelica and Alexander's story.
    `
  },
  {
    id: 'filter_themes',
    vizAlign: 'right',
    vizType: 'song',
    style: {
      marginTop: '100vh',
    },
    text: `

    `
  },
  {
    id: 'eliza1',
    vizAlign: 'left',
    vizType: 'line',
    style: {
      marginTop: '100vh',
    },
    text: `
When I first started listening to the soundtrack, I adored Angelica for her independence and intelligence - not to mention, her rap was *fierce*.  Eliza, on the other hand, was just...there for me.

But the more I listened, and the more I dug through Eliza's most common phrases, the more she grew on me.  I am now convinced that she - not Aaron Burr - is Alexander's best foil; she is the one that matures him, and she in turn comes into her own because of him.
    `
  },
];

export default sections;
