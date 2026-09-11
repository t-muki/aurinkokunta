# Aurinkokunta

Interaktiivinen kolmiulotteinen malli aurinkokunnasta. Planeettojen ja Kuun
sijainnit lasketaan valitulle ajanhetkelle todellisista ratatiedoista.

**➜ Malli pyörii selaimessa osoitteessa <https://t-muki.github.io/aurinkokunta/>**
Mitään ei tarvitse asentaa, ja sivu toimii myös puhelimella.

## Ominaisuudet

- **Reaaliaikaiset sijainnit.** Planeetat ja Kuu ovat siellä missä ne kulloinkin
  ovat. Ajassa voi liikkua vapaasti: pysäyttää, säätää nopeutta väliltä
  −1…+1 vuotta sekunnissa tai siirtyä suoraan haluttuun päivämäärään.
- **Tapahtumahypyt.** Edelliseen tai seuraavaan täysikuuhun, uuteenkuuhun,
  päivänseisaukseen, päiväntasaukseen sekä Marsin, Jupiterin ja Saturnuksen
  oppositioon. Aika kelautuu kohteeseen parissa sekunnissa, jolloin
  planeettojen liike matkan varrella näkyy.
- **Kolme mittakaavaa:** havainnollinen, oikeat kokosuhteet ja täysi
  1:1-mittakaava. Ks. [Mittakaavat](#mittakaavat).
- **Todellinen tähtitaivas.** NASA:n Deep Star Maps 2020, jossa tähdet ovat
  oikeilla paikoillaan. ✶-painike näyttää tähdistöviivat ja piilottaa ne.
- **Klikkaa kappaletta** niin kamera lähenee siihen ja seuraa sitä. Sivupaneeli
  kertoo perustiedot ja vaihtuvan faktan; jokaisesta kappaleesta on viisi.
- **Maan vuorokausi ja vuodenajat.** Pyörähdysasento on sidottu aurinkoaikaan ja
  akselikallistus osoittaa oikeaan suuntaan, joten valoisa puoli on oikea.
  Muiden planeettojen pyörähdysvaihe on mielivaltainen.
- Nimilaput, kiertoradat, Saturnuksen renkaat ja akselikallistukset.

## Mittakaavat

Aikapalkin valinnasta voi vaihtaa kolmen mittakaavan välillä ilman sivun
uudelleenlatausta. Kappaleiden suunnat ja ratojen muodot ovat kaikissa samat;
vain koot ja etäisyydet muuttuvat.

| | Havainnollinen | Oikeat kokosuhteet | Täysi mittakaava |
| --- | --- | --- | --- |
| Säde | ∝ r^0,6 | ∝ r (oikea) | ∝ r (oikea) |
| Etäisyys | ∝ AU^0,55 | ∝ AU^0,55 | ∝ AU (oikea) |
| Aurinko mittakaavassa | ei | kyllä | kyllä |
| Kuun etäisyys Maasta | 3,2 Maan sädettä | 12,8 | 60,3 (oikea) |

*Havainnollinen* on oletus: kaikki mahtuu samaan kuvaan ja näkyy kerralla.

*Oikeat kokosuhteet* on ainoa tila, jossa kokoerot näkyvät samassa kuvassa.
Aurinko on halkaisijaltaan 109 Maata ja Jupiterkin vain kymmenesosa Auringosta.

*Täysi mittakaava* on 1:1 sekä koossa että etäisyydessä. Kokonaiskuvassa jopa
Aurinko on kolmasosa pikselistä ja planeetat tuhannesosia — aurinkokunta on
lähes tyhjä, eikä sitä voi kiertää. Nimilaput merkitsevät paikat, ja niitä
klikkaamalla pääsee lähentymään. Vasta tässä tilassa Kuu on oikealla
etäisyydellään ja Aurinko näkyy Maasta oikean kokoisena, puolen asteen
levyisenä.

## Tarkkuus

Sijainnit perustuvat JPL:n likimääräisiin rataelementteihin (*Approximate
Positions of the Planets*, taulukko vuosille 1800–2050). **Kyseessä ei ole
täsmällinen efemeridi vaan sekulaarinen approksimaatio:** rataelementit
kehitetään lineaarisesti J2000-epookista, eikä planeettojen keskinäisiä
häiriöitä — kuten Jupiterin ja Saturnuksen suurta epätasaisuutta — ole
mallinnettu. JPL ilmoittaa taulukolleen suurimmiksi virheiksi heliosentrisessä
pituudessa 40″ Marsille, 400″ Jupiterille ja 600″ Saturnukselle.

Tapahtumat etsitään numeerisesti: kulmaa askelletaan ajassa ja merkinvaihdos
tarkennetaan puolitushaulla. Haku itsessään on sekunnin tarkkuudella, mutta
tuloksen tarkkuus rajoittuu rataelementteihin. **Ohjelma näyttää ajat minuutin
tarkkuudella, mutta kaikki eivät ole minuutin tarkkuudella oikein.**

### Päiväntasaukset ja -seisaukset: 1–11 minuuttia

Auringon pituus muunnetaan J2000-epookista hetken omaan
kevätpäiväntasauspisteeseen (prekessio ja aberraatio); ilman tätä ajat
osuisivat n. 9 tuntia myöhään 2020-luvulla.

| Tapahtuma | Laskettu | Julkaistu |
| --- | --- | --- |
| Kesäpäivänseisaus 2026 | 21.6. klo 08.26 UTC | 21.6. klo 08.25 UTC |
| Syyspäiväntasaus 2026 | 23.9. klo 00.16 UTC | 23.9. klo 00.05 UTC |
| Kevätpäiväntasaus 2026 | 20.3. klo 14.42 UTC | 20.3. klo 14.46 UTC |

### Oppositiot: minuutista kahteen tuntiin

Tämä on mallin suurin virhelähde, ja virhe kasvaa ulospäin mentäessä:

| Oppositio | Laskettu | Julkaistu | Ero |
| --- | --- | --- | --- |
| Mars 19.2.2027 | klo 15.44 UTC | klo 15.45 UTC | 1 min |
| Jupiter 11.2.2027 | klo 01.05 UTC | klo 00.21 UTC | 44 min |
| Saturnus 4.10.2026 | klo 14.11 UTC | klo 12.29 UTC | 1 h 42 min |

JPL:n virherajoista laskettuna pahin mahdollinen poikkeama on Marsilla noin
puoli tuntia, Jupiterilla kolme tuntia ja Saturnuksella neljä tuntia. Malli ei
myöskään korjaa valon kulkuaikaa, mikä siirtää Marsin oppositiota noin
4 minuuttia.

Oikea korjaus olisi vaihtaa tarkempaan ratateoriaan, esimerkiksi typistettyyn
VSOP87:ään, joka pudottaisi virheet kaarisekunteihin.

### Muut

| | Tarkkuus |
| --- | --- |
| Kuunvaiheet | n. puoli tuntia |
| Kuun sijainti | n. 0,5° (yksinkertaistetun kuuteorian raja) |
| Maan pyörähdysasento | ±4° eli ±15 min (ajantasaus jätetty huomiotta) |
| Tähtitaivaan suuntaus | tarkistettu 18 kirkkaan tähden sijainneilla |

## Käynnistys

Sivua ei voi avata suoraan tiedostosta: ES-moduulit ovat CORS-sääntöjen
alaisia, joten selain estää ne `file://`-osoitteesta. Tarvitaan siis paikallinen
web-palvelin:

```bash
node server.js
```

Avaa sitten selaimessa <http://localhost:8321>.

## Julkaisu GitHub Pagesiin

Sivu on täysin staattinen eikä vaadi käännösvaihetta. Kaikki polut ovat
suhteellisia ja kirjastot mukana `libs/`-kansiossa, joten sivu toimii myös
alihakemistossa ilman verkkoyhteyttä ulkopuolelle. Mukana on tyhjä
`.nojekyll`, joka estää Jekyll-käsittelyn.

Julkaisu: työnnä repo GitHubiin ja valitse *Settings → Pages → Source: Deploy
from a branch → main / (root)*. Tämä repo on julkaistu osoitteeseen
<https://t-muki.github.io/aurinkokunta/>, ja jokainen `main`-haaraan työnnetty
commit päivittyy sinne muutamassa minuutissa.

## Toteutus

Sisäiset ratkaisut ja niiden perustelut — mittakaavatilojen vaihto, ratojen
piirtotarkkuus, syvyyspuskuri ja piirron rajoitus — ovat omassa
tiedostossaan: [TOTEUTUS.md](TOTEUTUS.md).

## Lähteet

- Ratalaskenta: JPL, [*Approximate Positions of the Planets*](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- Kuun teoria: Paul Schlyterin yksinkertaistettu malli häiriötermeineen
- Planeettojen tekstuurit: [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0)
- Tähtitaivas ja tähdistöviivat: [NASA/Goddard SVS, Deep Star Maps 2020](https://svs.gsfc.nasa.gov/4851)
  (Ernie Wright; julkinen aineisto)
- Grafiikkamoottori: [Three.js](https://threejs.org/) r160 (mukana `libs/`-kansiossa)
