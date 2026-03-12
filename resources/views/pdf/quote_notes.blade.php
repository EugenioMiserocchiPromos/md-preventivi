<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <title>Preventivo {{ $quote->prot_display }} - Note</title>
    <style>
      @font-face {
        font-family: 'Jost';
        font-style: normal;
        font-weight: 700;
        src: url("{{ 'file://' . public_path('fonts/Jost/Jost-Bold.ttf') }}") format('truetype');
      }
      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 500;
        src: url("{{ 'file://' . public_path('fonts/OpenSans/OpenSans-Medium.ttf') }}") format('truetype');
      }
      @page notes {
        margin: 0;
      }
      html,
      body {
        height: 100%;
      }
      body {
        margin: 0;
      }
      .notes-page {
        page: notes;
        min-height: 100%;
        background-image: url("{{ 'file://' . public_path('pdf/bg-note-firme.jpg') }}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      .notes-content {
        padding: 150px 80px 150px 40px;
      }
      .notes-title {
        font-family: 'Jost', sans-serif;
        font-weight: 700;
        font-size: 14px;
        line-height: 16px;
        margin: 0 0 12px 0;
      }
      .notes-text {
        font-family: 'Open Sans', sans-serif;
        font-weight: 500;
        font-size: 11px;
        line-height: 13px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    @php
      // Testi note per pagina: valorizza questi campi nel backend.
      $notes_page_1 = $quote->notes_page_1 ?? '';
      $notes_page_2 = $quote->notes_page_2 ?? '';
    @endphp
    <section class="notes-page">
      <div class="notes-content">
        <h2 class="notes-title">Note</h2>
        <div class="notes-text">PRESCRIZIONI PER LA REALIZZAZIONE DELLA VASCA BIANCA PER CRISTALLIZZAZIONE PENETRON (REV090326)


1) La messa in opera e maturazione del calcestruzzo dovrà essere conforme alle direttive delle Norme Tecniche per le Costruzioni Testo Unico D.M. 17.01.2018 e la normativa UNI EN 206-1 e le "linee guida del calcestruzzo strutturale" del Consiglio Superiore dei Lavori Pubblici.

2) Lo spessore minimo delle platee e delle pareti in vasca bianca non può essere inferiore a 25 cm e comunque sempre dimensionato dal progettista strutturale in base alla sottospinta idraulica, prevedendo una doppia armatura;

3) Adottare sistemi di regimentazione delle acque con adeguata rete di drenaggio ed eventuale stazione di pompaggio, in modo da evitare getti in presenza d’acqua su manufatti ancora freschi. Tali sistemi dovranno garantire la corretta maturazione dei getti in calcestruzzi per 28 giorni e comunque rimanere attivi fino al raggiungimento di adeguato bilanciamento della sottospinta idraulica.

4) Utilizzare distanziatori in PVC o in cemento di altezza “minima” di 50 mm (comunque in relazione al copriferro previsto a progetto) da posarsi su strato adeguato di magrone per il distanziamento delle armature, anche i cavallotti di sostegno non dovranno essere appoggiati direttamente sul magrone ma sull'armatura inferiore correttamente distanziata. Evitare qualsiasi armatura appoggiata direttamente sul magrone e inglobata nel getto.

5) Durante le operazioni di getto la temperatura dell'impasto non deve superare 35°C; tale limite dovrà essere convenientemente ridotto nel caso di getti di grandi dimensioni.
La UNI EN 206-1 al punto 5.2.8 prescrive che il calcestruzzo fresco non abbia una temperatura inferiore ai 5°C gradi.

6) In caso di pioggia intensa non dovrà essere iniziato alcun getto, né di parete, né di platea. Nel caso in cui il fenomeno piovoso si manifesti improvvisamente durante il corso di un getto di platea, dovrà essere portato a termine nel più breve tempo possibile evitando di iniziarne uno successivo; per ovviare al fenomeno di dilavamento del calcestruzzo della porzione da portare a termine, l'impresa dovrà avere a disposizione teli di protezione da posarsi sulle parti già formate al finito.

7) Posare il calcestruzzo con autopompa, evitando l'utilizzo diretto della canala o il sollevamento in quota con l'ausilio della benna.

8) Posare il calcestruzzo con adeguata compattazione, tramite l'ausilio di minimo due vibratori ad ago di diametro adeguato. La posa deve essere eseguita per strati di spessore inferiore a 30 cm. L'ago va introdotto in posizione verticale immergendolo per una profondità̀ superiore a quella dello strato eseguito, per un tempo da determinare in funzione della classe di consistenza del calcestruzzo (esempio consistenza S4 circa 10-15 sec., consistenza S5 circa 5-10 sec.). L'operazione va ripetuta con un intervallo di circa 50 cm, evitando il contatto dell'ago con la cassaforma e i ferri di armatura.

9) E' vietata qualsiasi aggiunta di acqua nelle autobetoniere che potrebbe modificare lo slump previsto a progetto e compromettere la resistenza finale e la tenuta idraulica.

10) Ridurre al minimo l'altezza di caduta libera del calcestruzzo fresco per evitare la separazione dei suoi componenti. Utilizzare nei muri idonei tubi getto e/o prolunghe gommate.

11) Per la platea, procedere senza interruzioni, con il getto di calcestruzzo in continuità, per strisce "finite" nel rispetto delle indicazioni del progetto di impermeabilizzazione del Sistema PENETRON® senza riprese di getto. Qualora si verificassero sbavature o fuoriuscita di calcestruzzo dai casseri o reti fermagetto, si dovrà provvedere alla demolizione dei volumi di calcestruzzo eccedenti, opportuna pulizia dei “presidi complementari” del Sistema e dei ferri di armatura.

12) E' necessaria l'adozione di appositi accorgimenti per la corretta maturazione dei getti di platea con bagnatura degli stessi a saturazione con acqua per i primi 3 giorni, oppure, l’utilizzo di anti-evaporanti.

13) Gli accessori complementari di ripresa di getto e di fessurazione programmata del Sistema PENETRON®, sia di platea che di parete, dovranno essere adeguatamente fissati e sostenuti alle armature specifiche.
</div>
      </div>
    </section>

    <div style="page-break-after: always;"></div>

    <section class="notes-page">
      <div class="notes-content">
        <h2 class="notes-title">Note</h2>
        <div class="notes-text">
14) Per eventuali getti contro terra e contro palificata/diaframmi prevedere la posa di apposito strato separatore quale tessuto TNT da 400 g/mq., oppure, utilizzare teli di nylon per il confinamento di materiale estraneo al getto nelle fasi di realizzazione e pompaggio.

15) La rimozione delle casserature dei muri dovrà avvenire come “minimo” dopo 72 ore di maturazione dei getti e comunque in ottemperanza ai processi di maturazione nella Normativa vigente in cui le tempistiche di disarmo dipendono dalla temperatura e dall'umidità ambientale, dal tipo e quantità di cemento e da eventuali additivi impiegati. Il riferimento é la norma UNI EN 70:2010, le Linee Guida per la messa in opera del calcestruzzo strutturale ed alle Linee Guida per la valutazione delle caratteristiche del calcestruzzo in opera elaborate e pubblicate dal Servizio Tecnico Centrale del Consiglio Superiore dei Lavori Pubblici, la UNI EN 206 e la UNI 11104.
        
16) Per i corpi inglobati nella matrice in cls, quali in particolare le tubazioni in genere e di scarico acqua meteorica, devono essere fissati sulle armature superiori, sospesi con apposite barre e si prescrive uno strato minimo di 20 cm di calcestruzzo fra essi e il magrone.

17) Per i corpi passanti la matrice in calcestruzzo, di platea e dei muri di contenimento, quali in particolare le tubazioni in genere, scarichi e impianti, saranno dotati di appositi presidi di tenuta idraulica come da specifica di dettaglio del Sistema PENETRON®.

18) Per le chiamate dei getti orizzontali e verticali utilizzando elementi prefabbricati tipo STABOX si prescrive uno spessore dietro la cassetta di almeno 20 cm e l’inserimento di presidi in gomma idroespansiva nei ferri di ripresa. 

19) Qualsiasi modifica della posizione delle riprese di getto e di fessurazione programmata orizzontali e verticali in fase di realizzazione dell'opera, rispetto alle indicazioni del progetto di impermeabilizzazione del Sistema PENETRON®, dovrà essere autorizzata dal personale tecnico di MD Italia srl.

20) Le “non conformità esecutive” dei getti in calcestruzzo come: segregazione al piede, nidi di ghiaia, riprese di getto naturali (per tempistiche allungate o scarsa vibratura), mancanze della matrice e fessurazioni di vario genere: da ritiro igrometrico, indotte da cambio di sezione ed elementi passanti, saranno oggetto di apposito ciclo di ripristino previsto dal Sistema PENETRON®.

21) Il reinterro delle murature perimetrali dovrà avvenire generalmente a completa maturazione del cls, indicativamente a 28gg (o a avvenuta verifica, da parte della DL, della resistenza a compressione minima del cls) e comunque dopo che il personale di MD ITALIA s.r.l. abbia verificato la corretta chiusura dei fori dei tiranti dei casseri, delle fessurazioni programmate e il ripristino di eventuali “non conformità esecutive” della matrice in calcestruzzo. 

22) Il disarmo dei sistemi di sostegno provvisionale dello scavo (tiranti-puntoni) dovrà avvenire generalmente a completa maturazione del cls, indicativamente a 28gg (o a avvenuta verifica, da parte della DL, della resistenza a compressione minime del cls) e salvo progettazioni particolari dopo l'esecuzione e maturazione della soletta superiore e comunque dopo che il personale di MD ITALIA s.r.l. abbia verificato la corretta chiusura delle fessurazioni programmate e il ripristino di eventuali “non conformità esecutive” della matrice in calcestruzzo.
</div>
      </div>
    </section>
  </body>
</html>