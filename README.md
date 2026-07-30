# Aurinkokunta

Interaktiivinen kolmiulotteinen malli aurinkokunnasta. Planeettojen (ja Kuun)
sijainnit lasketaan todellisen ajanhetken mukaan JPL:n likimääräisistä
rataelementeistä.

## Käynnistys

Sivu tarvitsee paikallisen web-palvelimen (ES-moduulit eivät toimi suoraan
tiedostosta avattuna):

```bash
node server.js
```

Avaa sitten selaimessa <http://localhost:8321>.

## Julkaisu GitHub Pagesiin

Sivu on täysin staattinen eikä vaadi käännösvaihetta, joten se toimii Pagesissa
sellaisenaan. Kaikki polut ovat suhteellisia ja kirjastot mukana `libs/`-
kansiossa, joten sivu toimii myös alihakemistossa (`käyttäjä.github.io/repo/`)
ilman verkkoyhteyttä ulkopuolelle. Mukana on tyhjä `.nojekyll`, joka estää
Jekyll-käsittelyn.

Julkaisu: työnnä repo GitHubiin ja valitse *Settings → Pages → Source:
Deploy from a branch → main / (root)*.

## Ominaisuudet

- Planeettojen reaaliaikaiset sijainnit (JPL:n rataelementit, tarkkuus riittää
  visualisointiin vuosina 1800–2050)
- Kuu Maan kiertolaisena, sijainti laskettuna häiriötermeineen (tarkistettu
  tunnettuja uuden- ja täydenkuun hetkiä vasten)
- Vapaa pyöritys, lähennys ja panorointi hiirellä (OrbitControls)
- Aikakontrollit: pysäytys/jatka, nopeuden säätö (−1 v/s … +1 v/s),
  päivämäärään siirtyminen, paluu nykyhetkeen. Pysäytys lukitsee juuri sen
  hetken, ja jatkaminen lähtee siitä eteenpäin — ei hyppää nykyhetkeen
- Aikasiirtymät kelataan: aika liukuu kohdehetkeen 1,8–3,0 sekunnissa pehmeästi
  kiihtyen ja hidastuen, jolloin planeettojen liike matkan varrella näkyy.
  Kesto kasvaa hypyn pituuden mukaan. Nopeussäätimen koskettaminen keskeyttää
  kelauksen välittömästi
- Tähtitaivas on NASA:n Deep Star Maps 2020 -kartta, jossa tähdet ovat
  todellisilla paikoillaan (Hipparcos/Tycho-2). Suuntaus on varmistettu
  18 kirkkaan tähden sijainneilla, ja tähtikuviot ovat oikeinpäin myös
  peilautumisen osalta. ✶-painikkeella saa tähdistöviivat näkyviin ja pois
- Oikean alanurkan info-painike avaa paneelin, jossa on käyttöohjeet,
  mittakaavojen selitys, laskennan tarkkuustiedot sekä lähteet ja lisenssit
- Jokaisesta kappaleesta on viisi faktaa, joista näytetään aina seuraava, kun
  kappaletta klikkaa uudelleen. Tekstit ovat tiedostossa `js/facts.js`, ja
  listoihin saa vapaasti lisätä uusia
- Planeetan klikkaus avaa tietopaneelin, zoomaa kohteeseen ja lukitsee kameran
  seuraamaan sitä. Panorointi (oikea hiirinäppäin tai ctrl/shift + veto) säilyy
  seurannan aikana, ja saman kohteen klikkaus keskittää sen uudelleen. Rajaus väistää käyttöliittymäpaneeleita, joten kohde asettuu
  vapaan alueen keskelle. Painike *Koko aurinkokunta* (tai Esc) palauttaa
  kokonaiskuvaan, *Sisäplaneetat* rajaa näkymän Marsin radan sisäpuolelle.
  Yleisnäkymien etäisyys lasketaan kuvakulmasta ja ikkunan mittasuhteista,
  joten rajaus pysyy oikeana myös ikkunan kokoa muutettaessa
- Tapahtumahypyt edelliseen ja seuraavaan: täysikuu/uusikuu,
  päivänseisaus/-tasaus sekä Marsin, Jupiterin ja Saturnuksen oppositiot.
  Kukin painikepari siirtyy siihen ryhmän tapahtumaan, joka tulee ensin.
  Kontrollit ovat haitarin takana, aikasäätimet aina näkyvissä. Löytyneen
  tapahtuman nimi näkyy kelauksen ajan ja häipyy, kun ajassa on siirrytty
  yli 12 tuntia sen hetkestä
- Nimilaput, kiertoradat, Saturnuksen renkaat, akselikallistukset ja
  pyörähdysliike
- Maan pyörähdysasento on kalibroitu todelliseen aurinkoaikaan (keskiaurinko,
  tarkkuus n. ±4° eli ±15 min ajantasauksen verran), ja akselikallistus
  osoittaa oikeaan suuntaan, joten vuorokaudenajat ja vuodenajat näkyvät
  oikein — muiden planeettojen pyörähdysvaihe on mielivaltainen

## Mittakaavat

Koot ja etäisyydet on puristettu potenssifunktiolla (säde ∝ r^0.6,
etäisyys ∝ AU^0.55), jotta kokoerot säilyvät havainnollisina mutta kaikki
mahtuu samaan näkymään. Aurinko ei ole mittakaavassa. Kuun etäisyys Maasta on
havainnollistettu, mutta sen suunta vastaa todellista sijaintia.

## Lähteet

- Planeettojen tekstuurit: [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0)
- Tähtitaivas ja tähdistöviivat: [NASA/Goddard SVS, Deep Star Maps 2020](https://svs.gsfc.nasa.gov/4851)
  (Ernie Wright; julkinen aineisto)
- Ratalaskenta: JPL, "Approximate Positions of the Planets" (Keplerin
  rataelementit epookille J2000)
- Kuun teoria: Paul Schlyterin yksinkertaistettu malli häiriötermeineen
- Kolmiulotteisen grafiikan moottori: [Three.js](https://threejs.org/) r160
  (paikallisesti `libs/`-kansiossa)

## Tapahtumahaun tarkkuus

Tapahtumat etsitään numeerisesti: kulmaa (esim. Kuun ja Auringon näennäinen
etäisyys) askelletaan ajassa, ja merkinvaihdos tarkennetaan puolitushaulla.
Päiväntasausten ja -seisausten kohdalla Auringon pituus muunnetaan J2000-
epookista hetken omaan kevätpäiväntasauspisteeseen (prekessio ja aberraatio);
ilman tätä ajat osuisivat n. 9 tuntia myöhään 2020-luvulla. Verrattuna
julkaistuihin arvoihin:

| Tapahtuma | Laskettu | Julkaistu |
| --- | --- | --- |
| Kesäpäivänseisaus 2026 | 21.6. klo 08.26 UTC | 21.6. klo 08.25 UTC |
| Syyspäiväntasaus 2026 | 23.9. klo 00.16 UTC | 23.9. klo 00.05 UTC |
| Kevätpäiväntasaus 2026 | 20.3. klo 14.42 UTC | 20.3. klo 14.46 UTC |

Kuunvaiheiden tarkkuus on n. puoli tuntia (yksinkertaistetun kuuteorian raja).
