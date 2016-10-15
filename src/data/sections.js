
var sections = [
  {
    id: 'header',
    vizAlign: 'center',
    vizType: 'image',
    style: {
      width: '100%',
      top: 0,
      textAlign: 'center',
      marginTop: '20vh',
      marginBottom: '75vh',
      padding: '40px 0',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
    },
    text: `
<h1 style='font-size: 36px; line-height: 1.6'>
  An Interactive Visualization of<br />
  Every Line in Hamilton
</h1>
    `
  },
  {
    id: 'intro1',
    vizAlign: 'left',
    vizType: 'character',
    clips: ['/music/ouioui.mp3'],
    text: `
I first heard Hamilton while visiting my friend in St. Louis for her birthday.  For that entire weekend, I heard the same songs from the soundtrack on repeat.  She kept humming the same lines over and over:

<span class='music' data-char='5' data-clip='0'>
  <span class='control'></span>
  Oui oui, mon ami, je m’apelle Lafeyette! &nbsp;<br />
  &nbsp; The Lancelot of the Revolutionary set! &nbsp;<br />
  &nbsp; I came from afar, just to say “Bonsoir!” &nbsp;<br />
  &nbsp; Tell the King, “Casse toi!” Who’s the best? &nbsp;<br />
  &nbsp; C’est moi! &nbsp;
</span>


Catchy as it was, I hated the song by day two, and was ready to throttle her by day three; I flew back to San Francisco cursing Hamilton.

The second time I heard about Hamilton, I was in New York.  I was having coffee with a friend when he told me about being in a car with Hamilton for two hours.  He was doubtful at first (“a hip-hop musical?”), but as it went on, he couldn’t get over how unexpectedly transformative it was (“why am I crying over some guy I don’t even know?”).

After that glowing review, I knew I had to at least give it a try.
    `
  },
  {
    id: 'intro2',
    vizAlign: 'right',
    vizType: 'song',
    clips: ['/music/ouioui.mp3'],
    text: `
The first few times I listened, I accidentally had the soundtrack on shuffle.  I was tuning in and out of the lyrics when I suddenly heard:

<span class='music' data-char='12' data-clip='0'>
  When you’re gone, I’ll go mad<br />
  So don’t throw away this thing we had<br />
  Cuz when push comes to shove<br />
  I will kill your friends and family to remind you of my love
</span>

And I was like, holy crap what is this super abusive relationship?!  To which my boyfriend had to clarify that it was just King George singing to America (does that make things better?  I’m still not sure).  After that, I decided to actually listen to all the lyrics the whole way through.

That first time, I was sobbing by the end.

I had it on repeat for months.  It was all I listened to in my waking hours.  I was obsessed.  We listened so much we started to analyze the lyrics and musical styles.  We reveled in the layers of complexity, the double entredres, the clever word plays.

### We started to wonder what a visualization of Hamilton would look like.
    `
  }
];

export default sections;
