
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
    clips: [['/music/ouioui.mp3', ['5/2:40-44']]],
    text: `
I first heard Hamilton while visiting my friend in St. Louis for her birthday.  For that entire weekend, I heard the same song on repeat:

<span class='music' data-char='5' data-clip='0'>
  <span class='control'></span>
  Oui oui, mon ami, je m’apelle Lafeyette! &nbsp;<br />
  &nbsp; The Lancelot of the Revolutionary set! &nbsp;<br />
  &nbsp; I came from afar, just to say “Bonsoir!” &nbsp;<br />
  &nbsp; Tell the King, “Casse toi!” Who’s the best? &nbsp;<br />
  &nbsp; C’est moi! &nbsp;
</span>


Catchy as it was, I hated the song by day two, and was ready to throttle her by day three; I flew back to San Francisco cursing Hamilton.

The second time I heard about Hamilton, I was in New York.  I was having coffee with a friend when he told me about being in a car with Hamilton for two hours.  He was doubtful at first (“a hip-hop musical?”), but as it went on, he was overwhelmed by how transformative it was (“why am I crying over some guy I don’t even know?”).

After that glowing review, I knew I had to at least give it a try.
    `
  },
  {
    id: 'intro2',
    vizAlign: 'right',
    vizType: 'song',
    clips: [['/music/whenyouregone.mp3', ['12/7:1-40']]],
    text: `
The first few times I listened, I accidentally had the soundtrack on shuffle.  I was tuning in and out of the lyrics when I suddenly heard:

<span class='music' data-char='12' data-clip='0'>
  <span class='control'></span>
  When you’re gone, I’ll go mad &nbsp;<br />
  &nbsp; So don’t throw away this thing we had &nbsp;<br />
  &nbsp; Cuz when push comes to shove &nbsp;<br />
  &nbsp; I will kill your friends and family to remind you of my love &nbsp;
</span>

And I was like, holy crap what is this super abusive relationship?!  To which my boyfriend had to clarify that it was just King George singing to America (does that make things better?  I’m still not sure).  After that, I decided to actually listen to all the lyrics the whole way through.

That first time, I was sobbing by the end.

I had it on repeat for months.  It was all I listened to in my waking hours.  I was obsessed.  We listened so much we started to analyze the lyrics and musical styles.  We reveled in the layers of complexity, the double entredres, the clever word plays.

#### We started to wonder what a visualization of Hamilton would look like.
    `
  },
  {
    id: 'hamilton',
    vizAlign: 'center',
    vizType: 'image',
    style: {
      width: '90%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    clips: [
      ['/music/bastardorphan.mp3', ['1/1:1-5']],
      ['/music/disparaged.mp3', ['15/39:12-15']]
    ],
    text: `
Hamilton: An American Musical is the brain-child of Lin-Manuel Miranda, lovingly crafted over the course of six years.  It’s the story of Alexander Hamilton, the first Secretary of Treasury, most commonly remembered for being on the $10 bill and for dying in a duel (if remembered at all).

Most of us react the same way when we hear of a “hip-hop musical” about a Founding Father; we expect something corny, a desperate history lesson.  And certainly, Hamilton isn’t lacking in history.  The first act takes us through the American Revolution, and the second act the establishment of the Constitution and our current form of government.  (There’s a whole act about running the government - that by itself is absolute amazing.)

But the history is merely a backdrop, and hip-hop merely the medium in which Miranda chooses to tell his story.

Instead, Hamilton is the story of a
<span class='music' data-char='1' data-clip='0'>
  <span class='control'></span>
  bastard, orphan, son of a whore and a Scotsman, dropped in the middle of a forgotten spot in the Caribbean &nbsp;
</span>; an immigrant who rose up to become George Washington’s right hand, a prominent figure in early American politics, who wrote a whole financial system into existence.  It’s the story of Alexander Hamilton meeting Aaron Burr, his first friend and enemy, the last face he sees.  It’s the story of an ambiguous love triangle, as he marries Eliza Schuyler and flirts with her sister Angelica Schuyler.

We root for him because he is brilliant and he is young, scrappy, and hungry.  He is the underdog; he’s every single one of us that has struggled for our own place in society.  And then he is too confident, too smart for his own good, and too ambitious; he makes too many powerful enemies, and they try to frame him for embezzlement.  In his hubris, he publishes the truth - the nation’s first sex scandal - hoping to clear his name.  He loses his political career and he loses Eliza’s love.  He loses his son, who challenges a man to a duel because he
<span class='music' data-char='15' data-clip='1'>
  <span class='control'></span>
  disparaged my father’s legacy in front of a crowd, I can’t have that, I’m making my father proud. &nbsp;
</span>

We feel for him, because he has lost everything; he is every single one of us that have made regrettable mistakes.  It is also the story of what comes next: what comes next, when we are at our lowest?

Hamilton is painfully relatable in its humanity.
    `
  }
];

export default sections;
