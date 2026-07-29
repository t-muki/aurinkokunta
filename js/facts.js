// Tietopaneelin faktat. Jokaisella kappaleella on useita, ja niistä
// näytetään aina seuraava, kun kappaletta klikataan uudelleen.
// Listaan saa vapaasti lisätä uusia — pituudella ei ole ylärajaa.

export const FACTS = {
  sun: [
    'Aurinkokunnan keskustähti, jonka massa on 99,8 % koko aurinkokunnan massasta.',
    'Ytimessä lämpötila on noin 15 miljoonaa astetta, näkyvällä pinnalla enää noin 5 500 astetta.',
    'Auringossa muuttuu vetyä heliumiksi noin 600 miljoonaa tonnia sekunnissa.',
    'Valo kulkee Auringosta Maahan 8 minuuttia ja 20 sekuntia.',
    'Aurinko ei pyöri jäykkänä kappaleena: päiväntasaaja kiertää noin 25 vuorokaudessa, navat vasta 35:ssä.',
  ],
  mercury: [
    'Pienin ja Aurinkoa lähin planeetta. Pinnan lämpötila vaihtelee −173 ja +427 celsiusasteen välillä.',
    'Merkuriuksella ei ole käytännössä kaasukehää, joten taivas pysyy mustana myös keskellä päivää.',
    'Yksi aurinkovuorokausi kestää kaksi Merkuriuksen vuotta: planeetta ehtii kiertää Auringon kahdesti yhden päivän aikana.',
    'Rautaydin täyttää noin 80 % planeetan säteestä — suhteessa suurin koko aurinkokunnassa.',
    'Napojen kraattereissa, joihin auringonvalo ei koskaan yllä, on havaittu vesijäätä.',
  ],
  venus: [
    'Kirkkain planeetta taivaallamme. Paksu hiilidioksidikaasukehä tekee siitä aurinkokunnan kuumimman planeetan.',
    'Pintapaine on noin 92-kertainen Maahan verrattuna, eli sama kuin 900 metrin syvyydessä meressä.',
    'Venus pyörii takaperin, joten siellä Aurinko nousee lännestä.',
    'Venuksen vuorokausi (243 vrk) on pidempi kuin sen vuosi (225 vrk).',
    'Pilvet ovat rikkihappoa ja heijastavat noin kolme neljäsosaa auringonvalosta takaisin avaruuteen.',
  ],
  earth: [
    'Kotiplaneettamme — ainoa paikka, josta tunnetaan elämää.',
    'Ainoa planeetta, jonka pinnalla vettä esiintyy samanaikaisesti jäänä, nesteenä ja höyrynä.',
    'Noin 71 % pinnasta on veden peitossa.',
    'Magneettikenttä suojaa pintaa auringontuulelta ja synnyttää revontulet.',
    'Kuun aiheuttama vuorovesikitka hidastaa Maan pyörimistä: vuorokausi pitenee noin 1,7 millisekuntia vuosisadassa.',
  ],
  moon: [
    'Maan ainoa luonnollinen kiertolainen. Näyttää meille aina saman puolensa.',
    'Kuu loittonee Maasta noin 3,8 senttimetriä vuodessa.',
    'Kuun vetovoima aiheuttaa valtamerten vuorovedet.',
    'Ilman kaasukehää pinnan lämpötila heilahtaa +127 asteesta −173 asteeseen.',
    'Kuu syntyi todennäköisesti, kun Marsin kokoinen kappale törmäsi nuoreen Maahan.',
  ],
  mars: [
    'Punainen planeetta, jonka pinnalla on aurinkokunnan suurin tulivuori Olympus Mons.',
    'Olympus Mons kohoaa noin 22 kilometriä eli suunnilleen kaksi ja puoli kertaa Mount Everestin korkeuteen.',
    'Punaisen värin aiheuttaa pintaa peittävä ruostunut rautapöly.',
    'Valles Marineris -laaksosto on yli 4 000 kilometriä pitkä — Yhdysvaltain levyinen.',
    'Marsin vuorokausi on vain runsaan puoli tuntia Maan vuorokautta pidempi.',
  ],
  jupiter: [
    'Aurinkokunnan suurin planeetta. Suuri punainen pilkku on satoja vuosia riehunut myrsky.',
    'Jupiter painaa yli kaksi kertaa niin paljon kuin kaikki muut planeetat yhteensä.',
    'Suureen punaiseen pilkkuun mahtuisi koko Maa.',
    'Jupiter pyörii planeetoista nopeimmin: vuorokausi kestää alle kymmenen tuntia.',
    'Galilei löysi neljä suurinta kuuta vuonna 1610. Nykyään niitä tunnetaan yli 90.',
  ],
  saturn: [
    'Tunnetaan upeista renkaistaan, jotka koostuvat jäästä ja kivestä.',
    'Rengasjärjestelmän halkaisija on noin 280 000 kilometriä, mutta paksuus paikoin vain kymmeniä metrejä.',
    'Saturnus on niin kevyt, että se kelluisi vedessä: sen tiheys jää veden tiheyden alle.',
    'Noin 15 vuoden välein renkaat kääntyvät särmä kohti Maata ja katoavat lähes näkyvistä.',
    'Titan-kuulla on paksu kaasukehä ja nestemäisen metaanin järviä.',
  ],
  uranus: [
    'Kiertää Aurinkoa kyljellään — akselin kallistus on lähes 98°.',
    'Kallistuksen vuoksi navoilla on 42 vuotta kestävä päivä ja yhtä pitkä yö.',
    'Sinivihreän värin aiheuttaa kaasukehän metaani, joka imee itseensä punaista valoa.',
    'Ensimmäinen kaukoputkella löydetty planeetta: William Herschel havaitsi sen vuonna 1781.',
    'Uranuksesta on mitattu planeettojen kylmin lämpötila, noin −224 astetta.',
  ],
  neptune: [
    'Uloin planeetta, jossa puhaltavat aurinkokunnan kovimmat tuulet, yli 2 000 km/h.',
    'Neptunus löydettiin laskemalla: sen paikka ennustettiin Uranuksen radan häiriöistä vuonna 1846.',
    'Yksi Neptunuksen vuosi kestää noin 165 Maan vuotta, joten se on kiertänyt Auringon vasta kerran löytymisensä jälkeen.',
    'Suurin kuu Triton kiertää planeettaa vastasuuntaan, joten se on luultavasti kaapattu Kuiperin vyöhykkeeltä.',
    'Neptunus säteilee enemmän lämpöä kuin saa Auringosta.',
  ],
};
