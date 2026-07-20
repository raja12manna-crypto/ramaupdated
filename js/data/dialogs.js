/* ============================================================
   RAMA — The Retro Game · data/dialogs.js — NPC conversations
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Dialogue data ---------------- */
const DIALOGS={
  guard:[ ['Guard of the East Gate','Welcome, Prince Rama! The city shines brighter when you walk its streets.'],
          ['Guard of the East Gate','The training grounds lie to the east. Guru Vashishtha was asking for you.'] ],
  flower:[ ['Malati the Flower-seller','Marigolds for the temple, jasmine for the evening... and for you, prince — a garland of blessings!'],
           ['Malati the Flower-seller','They say when you were born, every tree in Ayodhya flowered out of season.','entry:city_of_light'] ],
  child1:[ ['Little Chandu','Prince! Prince! Watch me — I can run faster than my shadow!'],
           ['Little Chandu','When I grow up I want to be brave like you and Lakshmana bhaiya!','entry:four_princes'] ],
  potter:[ ['Kumbha the Potter','A pot is only useful because of the emptiness inside it, prince. My guru said people are the same.'],
           ['Kumbha the Potter','Take care on the east road — the mud is soft after last night\'s rain.'] ],
  priest:[ ['Temple Priest','Ring the bell, young one. Not for the gods — for yourself.','entry:temple_bell'],
           ['Temple Priest','Dharma is not a rule, Rama. It is a direction. Walk it and the path appears.','entry:dharma_word'] ],
  washer:[ ['Dhobi by the Sarayu','The river is calm today. She likes it when the princes visit.','entry:sarayu'],
           ['Dhobi by the Sarayu','I have washed the robes of three generations of your family. The Sarayu remembers them all.'] ],
  musician:[ ['Wandering Veena Player','Listen... the evening raga. Yaman — the sound of longing for what is good.'],
             ['Wandering Veena Player','Music and dharma are alike, prince: both are about what you choose NOT to play.'] ],
  guru:[ ['Guru Vashishtha','Ah, Rama. You have walked among your people — that is the first lesson, and you learned it without being taught.'],
         ['Guru Vashishtha','Tomorrow, the bow. A prince who knows his people\'s faces will never loose an arrow carelessly.','entry:guru_blessing'],
         ['Guru Vashishtha','Rest now. Great roads begin from quiet mornings.'] ],
  sita_hint:[ ['Old Grandmother','You smile like spring, child. Somewhere far away in Mithila, they say a princess garlands the dawn. Fate weaves quietly...'] ],
  hermit:[ ['Forest Hermit','So the palace\'s loss is the forest\'s gain. Walk gently, prince — here, every leaf is a scripture.','entry:forest_life'],
           ['Forest Hermit','The Ganga lies east. If you would cross her, seek Guha — king of the Nishadas. No man knows her moods better.'] ],
  guha:[ ['Guha, King of the Nishadas','Rama! Word runs faster than rivers. My kingdom is forest and water — and all of it is yours, brother.'],
         ['Guha, King of the Nishadas','You will not take my throne? Then take my boat, and my arms, and my heart with them.','entry:guha_friend'],
         ['Guha, King of the Nishadas','The Ganga is calm tonight. Step in when you are ready — I will row you across myself.'] ]
};

