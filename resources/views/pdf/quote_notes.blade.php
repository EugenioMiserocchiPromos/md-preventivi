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
        @bottom-center {
          content: element(notes-signatures);
          width: 100%;
        }
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
        background-image: url("{{ 'file://' . public_path('pdf/frontespizio-bg.jpg') }}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
      .notes-content {
        padding: 150px 40px;
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
      .notes-signatures {
        position: running(notes-signatures);
        display: block;
        width: 100%;
        padding: 0 40px 330px;
        box-sizing: border-box;
        margin: 0;
      }
      .notes-signatures-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .notes-signatures-table td {
        width: 48%;
        padding: 0;
        vertical-align: top;
      }
      td.notes-signatures-spacer {
        width: 4%!important;
      }
      .notes-signature-box {
        border-bottom: 1px solid #95817b;
        height: 44px;
        width: 100%;
        box-sizing: border-box;
      }
      .notes-signature-label {
        font-family: 'Jost', sans-serif;
        font-weight: 500;
        text-align:center;
        font-size: 10px;
        line-height:12px;
        color: #000000;
        margin-bottom: 6px;
        margin-bottom: 6px;
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
        <div class="notes-text">Perfe raturio to to omni ducimi, tem ut lam, con et faccae eum quis volestiis cus doluptur, te corersperum eumquo exero cusam necte natemque ditat et ea volorum doluptatem derit voloriatior serum, odigenissi ommodio remquide que vollit maximaximi, a digent aut aliciatqui init quae. Pideris doluptassime volum ullacestrum estrupicia cus.
          Da volor aliquation es etum qui incto bea quas untem quunt, odis acepell andaecabo. Rum is dere nimus, aliquiat aut que lationsenesta coriam enditatem con cum imaxim ra nimenis sum etur sa evendio. Rum, ati volorep tatatia conseque eventus quae veraect otaqui
          as doloriam, coriam earci acest faccaborupta corest quidit quatecab ipsame verum dolupta teseque et in re nulluptae landand ipicili caboreres adia veliat ea conse a de dolupta pra voluptas aut et quam, invenimus modipis id quis eiusciae coremque eos ute verum vid ex eostias is maxim verciet ex et quat.
          Ga. Paria id moluptatur, quiam fugiam quam, et voluptat.
          Udia quod utecepudit ipsuntiur mo tectorrum is es quundia eriosa quatus, cus, to et aspere, te pos eatissi que nimagnis idelissim sam aditasp electem quiaernatio modipsam ut alitatur mi, ut aspienderum lanto voluptatur, vit occus voluptate il ent officil in et eum fugitibusdam num inti ipsum arum res ius dolorenis voluptatia cus ressinv elibus sam, audipit auda id unt restius aditia sunti illorum comnimi nihilitatint eaqui dolorro et qui unt.
          Obitectur sim quunt qui ommolec ullorum natiunt qui doluptur aut quis et adios dolore aut volor sa sapitaturior arum quiam, acium ut landuscit la dolenim inctem quam quo intis iducien iendis et animo voles imet vendae nimus et ma quos et, omnis mo modi temposant quiaese ritatem faccum issus aut min nimust fugite cus, esti inistior alitasp ellest voles asperferovid mod es alique verspis in consent auda aut volest, con pa peliquam et occulparit et recearunt.
          Onsed quibus cum ipis il intius sint landignis elit ea corrum, omnisit ut dustem vollora natia digendae occulla boriae core et et repel iducide llabora sim accumque et expere cum vendunt remporecerem et aut adi aut eicit, et lab ipit est optatiam ati officabo. Evere iumenec tusam, omnis niam quosam sam hilit rerchic iderchil maio venda qui nam, volupta perrum aut et est voluptam aboreicia quo modit volupta nihitia dolorer natibus molupta temperor asi aut plaborese ime cus aut ut doluptur suntur? Ibeaque volut rerfernatet fugiae remqui voluptaquia im remost quae sitaspicil molupta quassum nim si cusapel et, etur?
          Bist, si venis ut que minctem qui as cusa exerro quis aut lab ipide natis delia quae percipid quidunt. Lenis dolupta sum quaeped quas secerum etur sum vendebit etum nus mod qui accus molo eum quid eum quae lam velles qui dolecto eosaepro escit, sam et veni suntis dolore consequias rerehent incte est denduscia doluptam qui occus sum repeliquam, volorestrum recaborem ressitate sum ulpa vendandus que simint odionsed molor aut que por re voluptae. Nam etur atestrum fugiatem faces apientur, omnihit res eum et maioruntisim est inci conse lab ipissim apellaut occum que cusa doluptasse sum sum qui cus exerunt ibusdaerio mo essimus cus min remos ut mo ium reictore sequia voluptibus autempe similluptate nonseque is acerchit lantem alitamus susae. Nam,
          sa num qui dem ut elit odictint aut veliquae qui si cuptas essum que prem facepro blatumet erum enitatus, temped qui consequo bere, omnit, voleceperum exerrum audaecti core volum hillandae nimin re el ipsa doluptae re volupti orehent oditatu rioribus, con core, sum fugitassum quos doluptatem saes delibea quasper iatio. Cuptat quae voluptaecat.
          Boreste nuscipsam ute simo quam qui aut vollabo. Uritatemos et modist ea nia vit, evernat usciae nus re plabor autem. Ebit resecti untentor rectotaquae corero qui nonsequam eaqui nam nam esciaec atendit aquiatur accum repe sitae provitame volupta con con ea eatibus ide labo. Lacipiendae labo. Nequis earum volorporum quibus minihit, cum qui voluptae quos dolut hariore rchilit ecatis dolorum rem velecto blaborit et omnis senduntur? Agnist, ommostios sit quatatist volorerro conem nonsequo voloria tatibus magnis sunt acia doloris di dolupta tiatum re, sum estem facero corerio repudam nate volupta qui blaut facepudipide volupid uciisqu idenim el minctat emporepero te derferi buscitaque nonse quo corem rem quae il mossincit doluptionet aut aut omnienihil iliberitas rerrum imusam,
          volo inverep electotature non eossi blamus, quam quam aut et ommolores maionseque laccus milist, custio exceptatiae poritia dipsusd andandaero odi omnihilla endam num iusdandebit ventis coris ant dollorempos de is eumque vid que officimi, volo quatum quibusae sinvel ipsantoris seditat est adit alitate verciaepudae lauditatiur rerio ipsam sitae volor rent.
        </div>
                <div class="notes-signatures">
          <table class="notes-signatures-table">
            <tr>
              <td>
                <div class="notes-signature-label">MD Italia Srl</div>
                <div class="notes-signature-box"></div>
              </td>
              <td class="notes-signatures-spacer"></td>
              <td>
                <div class="notes-signature-label">Firma dell’acquirente per accettazione</div>
                <div class="notes-signature-box"></div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </section>

    <div style="page-break-after: always;"></div>

    <section class="notes-page">
      <div class="notes-content">
        <h2 class="notes-title">Note</h2>
        <div class="notes-text">Perfe raturio to to omni ducimi, tem ut lam, con et faccae eum quis volestiis cus doluptur, te corersperum eumquo exero cusam necte natemque ditat et ea volorum doluptatem derit voloriatior serum, odigenissi ommodio remquide que vollit maximaximi, a digent aut aliciatqui init quae. Pideris doluptassime volum ullacestrum estrupicia cus.
          Da volor aliquation es etum qui incto bea quas untem quunt, odis acepell andaecabo. Rum is dere nimus, aliquiat aut que lationsenesta coriam enditatem con cum imaxim ra nimenis sum etur sa evendio. Rum, ati volorep tatatia conseque eventus quae veraect otaqui
          as doloriam, coriam earci acest faccaborupta corest quidit quatecab ipsame verum dolupta teseque et in re nulluptae landand ipicili caboreres adia veliat ea conse a de dolupta pra voluptas aut et quam, invenimus modipis id quis eiusciae coremque eos ute verum vid ex eostias is maxim verciet ex et quat.
          Ga. Paria id moluptatur, quiam fugiam quam, et voluptat.
          Udia quod utecepudit ipsuntiur mo tectorrum is es quundia eriosa quatus, cus, to et aspere, te pos eatissi que nimagnis idelissim sam aditasp electem quiaernatio modipsam ut alitatur mi, ut aspienderum lanto voluptatur, vit occus voluptate il ent officil in et eum fugitibusdam num inti ipsum arum res ius dolorenis voluptatia cus ressinv elibus sam, audipit auda id unt restius aditia sunti illorum comnimi nihilitatint eaqui dolorro et qui unt.
          Obitectur sim quunt qui ommolec ullorum natiunt qui doluptur aut quis et adios dolore aut volor sa sapitaturior arum quiam, acium ut landuscit la dolenim inctem quam quo intis iducien iendis et animo voles imet vendae nimus et ma quos et, omnis mo modi temposant quiaese ritatem faccum issus aut min nimust fugite cus, esti inistior alitasp ellest voles asperferovid mod es alique verspis in consent auda aut volest, con pa peliquam et occulparit et recearunt.
          Onsed quibus cum ipis il intius sint landignis elit ea corrum, omnisit ut dustem vollora natia digendae occulla boriae core et et repel iducide llabora sim accumque et expere cum vendunt remporecerem et aut adi aut eicit, et lab ipit est optatiam ati officabo. Evere iumenec tusam, omnis niam quosam sam hilit rerchic iderchil maio venda qui nam, volupta perrum aut et est voluptam aboreicia quo modit volupta nihitia dolorer natibus molupta temperor asi aut plaborese ime cus aut ut doluptur suntur? Ibeaque volut rerfernatet fugiae remqui voluptaquia im remost quae sitaspicil molupta quassum nim si cusapel et, etur?
          Bist, si venis ut que minctem qui as cusa exerro quis aut lab ipide natis delia quae percipid quidunt. Lenis dolupta sum quaeped quas secerum etur sum vendebit etum nus mod qui accus molo eum quid eum quae lam velles qui dolecto eosaepro escit, sam et veni suntis dolore consequias rerehent incte est denduscia doluptam qui occus sum repeliquam, volorestrum recaborem ressitate sum ulpa vendandus que simint odionsed molor aut que por re voluptae. Nam etur atestrum fugiatem faces apientur, omnihit res eum et maioruntisim est inci conse lab ipissim apellaut occum que cusa doluptasse sum sum qui cus exerunt ibusdaerio mo essimus cus min remos ut mo ium reictore sequia voluptibus autempe similluptate nonseque is acerchit lantem alitamus susae. Nam,
          sa num qui dem ut elit odictint aut veliquae qui si cuptas essum que prem facepro blatumet erum enitatus, temped qui consequo bere, omnit, voleceperum exerrum audaecti core volum hillandae nimin re el ipsa doluptae re volupti orehent oditatu rioribus, con core, sum fugitassum quos doluptatem saes delibea quasper iatio. Cuptat quae voluptaecat.
          Boreste nuscipsam ute simo quam qui aut vollabo. Uritatemos et modist ea nia vit, evernat usciae nus re plabor autem. Ebit resecti untentor rectotaquae corero qui nonsequam eaqui nam nam esciaec atendit aquiatur accum repe sitae provitame volupta con con ea eatibus ide labo. Lacipiendae labo. Nequis earum volorporum quibus minihit, cum qui voluptae quos dolut hariore rchilit ecatis dolorum rem velecto blaborit et omnis senduntur? Agnist, ommostios sit quatatist volorerro conem nonsequo voloria tatibus magnis sunt acia doloris di dolupta tiatum re, sum estem facero corerio repudam nate volupta qui blaut facepudipide volupid uciisqu idenim el minctat emporepero te derferi buscitaque nonse quo corem rem quae il mossincit doluptionet aut aut omnienihil iliberitas rerrum imusam,
          volo inverep electotature non eossi blamus, quam quam aut et ommolores maionseque laccus milist, custio exceptatiae poritia dipsusd andandaero odi omnihilla endam num iusdandebit ventis coris ant dollorempos de is eumque vid que officimi, volo quatum quibusae sinvel ipsantoris seditat est adit alitate verciaepudae lauditatiur rerio ipsam sitae volor rent.
        </div>
        <div class="notes-signatures">
          <table class="notes-signatures-table">
            <tr>
              <td>
                <div class="notes-signature-label">MD Italia Srl</div>
                <div class="notes-signature-box"></div>
              </td>
              <td class="notes-signatures-spacer"></td>
              <td>
                <div class="notes-signature-label">Firma dell’acquirente per accettazione</div>
                <div class="notes-signature-box"></div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </section>
  </body>
</html>
