-- =============================================================
-- Test Data Generation Script
--
--   All data is generated arithmetically using tblNumbers — a helper
--   table containing integers 1..100000. By joining tblNumbers and
--   applying modulo arithmetic, we produce consistent, repeatable
--   rows without cursors, loops, or procedural logic. tblAttendance 
--   does not use tblNumbers as a row source. Instead it hashes (enrolmentID, sessionID) 
--   into a number and uses WHERE n.n <= @seed_attendance as a sampling filter,
--   producing a deterministic ~75% attendance rate across all sessions.
--
-- AUTHORS:
--   Oliver Statham  — tblCountry, tblRegion, tblBeneficiary,
--                     tblProgrammeFunding lookup data
--   Patrick Beattie — tblCourse, tblProgramme, tblProgrammeCourse,
--                     tblProgrammeStatus, tblCourseSkillCategory
--   Stephen Brown   — tblTeam, tblStaff, tblSessionStaff,
--                     tblTeamSpecialisation
--   Roman Kriuchkov — tblSession, tblEnrolment, tblAttendance,
--                     tblOutcome, tblFundingSource, tblOutcomeType,
--                     tblNames, tblSurnames, tblNumbers seed logic
--
-- Seed row-count configuration
-- =============================================================
SET @seed_region            = 60;
SET @seed_team              = 40;
SET @seed_course            = 80;
SET @seed_beneficiary       = 1200;
SET @seed_staff             = 200;
SET @seed_programme         = 120;
-- ~2 courses per programme
SET @seed_programmecourse   = @seed_programme * 2;
-- ~2 funding records per programme
SET @seed_programmefunding  = @seed_programme * 2;
-- ~7 sessions per programme-course link
SET @seed_session           = @seed_programmecourse * 7;
-- ~20 enrolments per programme-course link
SET @seed_enrolment         = @seed_programmecourse * 20;
-- ~75% attendance rate across enrolments x sessions
SET @seed_attendance        = @seed_enrolment * 4;
-- ~60% of enrolments receive an outcome record
SET @seed_outcome           = @seed_enrolment * 0.6;
-- Lead Trainer + Coordinator always, Co-Trainer 50%, Observer 20% = ~2.7 staff per session
SET @seed_sessionstaff = FLOOR(@seed_session * 2.7);



START TRANSACTION;
INSERT INTO tblCountry (countryName) VALUES ('Afghanistan'),('Albania'),('Algeria'),('American Samoa'),('Andorra'),('Angola'),('Anguilla'),('Antarctica'),('Antigua and Barbuda'),('Argentina'),('Armenia'),('Aruba'),('Australia'),('Austria'),('Azerbaidjan'),('Bahamas'),('Bahrain'),('Bangladesh'),('Barbados'),('Belarus'),('Belgium'),('Belize'),('Benin'),('Bermuda'),('Bhutan'),('Bolivia'),('Bosnia-Herzegovina'),('Botswana'),('Bouvet Island'),('Brazil'),('British Indian Ocean Territory'),('Brunei Darussalam'),('Bulgaria'),('Burkina Faso'),('Burundi'),('Cambodia'),('Cameroon'),('Canada'),('Cape Verde'),('Cayman Islands'),('Central African Republic'),('Chad'),('Chile'),('China'),('Christmas Island'),('Cocos (Keeling) Islands'),('Colombia'),('Comoros'),('Congo'),('Cook Islands'),('Costa Rica'),('Croatia'),('Cuba'),('Cyprus'),('Czech Republic'),('Denmark'),('Djibouti'),('Dominica'),('Dominican Republic'),('East Timor'),('Ecuador'),('Egypt'),('El Salvador'),('Equatorial Guinea'),('Eritrea'),('Estonia'),('Ethiopia'),('Falkland Islands'),('Faroe Islands'),('Fiji'),('Finland'),('France'),('France (European Territory)'),('French Guyana'),('French Southern Territories'),('Gabon'),('Gambia'),('Georgia'),('Germany'),('Ghana'),('Gibraltar'),('Great Britain'),('Greece'),('Greenland'),('Grenada'),('Guadeloupe (French)'),('Guam (USA)'),('Guatemala'),('Guinea'),('Guinea Bissau'),('Guyana'),('Haiti'),('Heard and McDonald Islands'),('Honduras'),('Hong Kong'),('Hungary'),('Iceland'),('India'),('Indonesia'),('Iran'),('Iraq'),('Ireland'),('Israel'),('Italy'),('Ivory Coast (Cote D`Ivoire)'),('Jamaica'),('Japan'),('Jordan'),('Kazakhstan'),('Kenya'),('Kiribati'),('Kuwait'),('Kyrgyzstan'),('Laos'),('Latvia'),('Lebanon'),('Lesotho'),('Liberia'),('Libya'),('Liechtenstein'),('Lithuania'),('Luxembourg');
INSERT INTO tblCountry (countryName) VALUES ('Macau'),('Macedonia'),('Madagascar'),('Malawi'),('Malaysia'),('Maldives'),('Mali'),('Malta'),('Marshall Islands'),('Martinique (French)'),('Mauritania'),('Mauritius'),('Mayotte'),('Mexico'),('Micronesia'),('Moldavia'),('Monaco'),('Mongolia'),('Montserrat'),('Morocco'),('Mozambique'),('Myanmar'),('Namibia'),('Nauru'),('Nepal'),('Netherlands'),('Netherlands Antilles'),('Neutral Zone'),('New Caledonia (French)'),('New Zealand'),('Nicaragua'),('Niger'),('Nigeria'),('Niue'),('Norfolk Island'),('North Korea'),('Northern Mariana Islands'),('Norway'),('Oman'),('Pakistan'),('Palau'),('Panama'),('Papua New Guinea'),('Paraguay'),('Peru'),('Philippines'),('Pitcairn Island'),('Poland'),('Polynesia (French)'),('Portugal'),('Puerto Rico'),('Qatar'),('Reunion (French)'),('Romania'),('Russian Federation'),('Rwanda'),('S. Georgia & S. Sandwich Isls.'),('Saint Helena'),('Saint Kitts & Nevis Anguilla'),('Saint Lucia'),('Saint Pierre and Miquelon'),('Saint Tome and Principe'),('Saint Vincent & Grenadines'),('Samoa'),('San Marino'),('Saudi Arabia'),('Senegal'),('Seychelles'),('Sierra Leone'),('Singapore'),('Slovak Republic'),('Slovenia'),('Solomon Islands'),('Somalia'),('South Africa'),('South Korea'),('Spain'),('Sri Lanka'),('Sudan'),('Suriname'),('Svalbard and Jan Mayen Islands'),('Swaziland'),('Sweden'),('Switzerland'),('Syria'),('Tadjikistan'),('Taiwan'),('Tanzania'),('Thailand'),('Togo'),('Tokelau'),('Tonga'),('Trinidad and Tobago'),('Tunisia'),('Turkey'),('Turkmenistan'),('Turks and Caicos Islands'),('Tuvalu'),('Uganda'),('Ukraine'),('United Arab Emirates'),('United Kingdom'),('United States'),('USA Minor Outlying Islands'),('Uruguay'),('Uzbekistan'),('Vanuatu'),('Vatican City State'),('Venezuela'),('Vietnam'),('Virgin Islands (British)');
INSERT INTO tblCountry (countryName) VALUES ('Virgin Islands (USA)'),('Wallis and Futuna Islands'),('Western Sahara'),('Yemen'),('Zaire'),('Zambia'),('Zimbabwe');
INSERT INTO tblNames (name) VALUES ('Abagael'),('Bab'),('Cabrina'),('Dacey'),('E''lane'),('Fabrianne'),('Gabbey'),('Hadria'),('Ianthe'),('Jacenta'),('Kacey'),('La'),('Mab'),('Nada'),('Octavia'),('Pacifica'),('Queada'),('Rachael'),('Sarene'),('Willamina'),('Zarah'),('Adella'),('Adi'),('Adore'),('Adria'),('Adriane'),('Adriena'),('Aeriell'),('Agatha'),('Aggy'),('Agnese'),('Agretha'),('Aila'),('Ailene'),('Ailyn'),('Aina'),('Ainslie'),('Alana'),('Alayne'),('Albina'),('Aleecia'),('Alena'),('Alethea'),('Alexandrina'),('Alexine'),('Ali'),('Alicea'),('Alina'),('Alisha'),('Alix'),('Allegra'),('Allie'),('Allissa'),('Allyn'),('Almeda'),('Almire'),('Alpa'),('Alvina'),('Alyda'),('Alysia'),('Amabel'),('Amaleta'),('Amalle'),('Amandy'),('Amber'),('Ame'),('Ameline'),('Amity'),('Anabel'),('Analiese'),('Anastasia'),('Andee'),('Andrea'),('Andria'),('Andromeda'),('Anett'),('Angel'),('Angelica'),('Angelique'),('Angil'),('Anissa'),('Anjanette'),('Ann-marie'),('Anna-maria'),('Annabell'),('Annadiane'),('Annalisa'),('Annamaria'),('Anne-mar'),('Annelise'),('Anni'),('Annmaria'),('Anny'),('Anthe'),('Antonella'),('Antonietta'),('Appolonia'),('Arabel'),('Arabelle'),('Ardelia'),('Arden'),('Ardis'),('Ardys'),('Ariana'),('Ariela'),('Arlee'),('Arlene'),('Arlie'),('Arline'),('Aryn'),('Ashlen'),('Ashly'),('Astrix'),('Atlanta'),('Aubree'),('Aubry'),('Audre'),('Audrye'),('Augustina'),('Aurel'),('Auria'),('Auroora'),('Austina'),('Averil'),('Aviva'),('Ayn'),('Babita'),('Bamby'),('Barbara-anne'),('Barbette'),('Barbra'),('Barry'),('Bea'),('Beatriz'),('Becka'),('Bee'),('Bel'),('Belita'),('Bellanca'),('Belvia'),('Benedikta'),('Bennie'),('Beret'),('Bernadette'),('Bernardine'),('Bernette'),('Bernita'),('Berry'),('Bertha'),('Bertina'),('Beryle'),('Beth'),('Bethina'),('Bette'),('Betti'),('Betty'),('Beverie'),('Bevvy');
INSERT INTO tblNames (name) VALUES ('Bidget'),('Billy'),('Bird'),('Blair'),('Blakeley'),('Blanche'),('Bliss'),('Blondelle'),('Bo'),('Bobby'),('Bobinette'),('Bonnie'),('Brande'),('Brandie'),('Breanne'),('Bren'),('Brenna'),('Brianna'),('Bridgett'),('Brietta'),('Brigitta'),('Briny'),('Britani'),('Britt'),('Britte'),('Brooks'),('Bryana'),('Brynna'),('Bunnie'),('Cacilia'),('Cal'),('Calli'),('Calypso'),('Camella'),('Camila'),('Cammi'),('Candace'),('Candide'),('Candy'),('Caralie'),('Caressa'),('Caria'),('Carin'),('Carissa'),('Carlee'),('Carlene'),('Carlin'),('Carlita'),('Carlye'),('Carma'),('Carmelina'),('Carmen'),('Carmon'),('Carola'),('Carolee'),('Carolina'),('Carolyne'),('Carri'),('Carroll'),('Caryn'),('Casia'),('Cassandre'),('Cassi'),('Cat'),('Catha'),('Cathee'),('Cathi'),('Cathrin'),('Cathyleen'),('Catlaina'),('Catriona'),('Cecil'),('Cecilla'),('Celene'),('Celestina'),('Celia'),('Celine'),('Cesya'),('Chandra'),('Charil'),('Charisse'),('Charlean'),('Charline'),('Charlotte'),('Charmian'),('Charyl'),('Chelsey'),('Chere'),('Cherice'),('Cherilynn'),('Cherlyn'),('Chery'),('Chiarra'),('Chloe'),('Chriss'),('Christa'),('Christal'),('Christel'),('Christiana'),('Christina'),('Chrysa'),('Chrystel'),('Ciel'),('Cindelyn'),('Cindra'),('Cissy'),('Clarabelle'),('Claretta'),('Claribel'),('Clarine'),('Clarita'),('Claudetta'),('Claudina'),('Clemence'),('Clemmie'),('Clerissa'),('Cloe'),('Codee'),('Coleen'),('Colleen'),('Colline'),('Conchita'),('Connie'),('Constancia'),('Constantina'),('Cookie'),('Corabelle'),('Coralyn'),('Cordie'),('Corella'),('Coretta'),('Corie'),('Corinna'),('Corliss'),('Cornelle'),('Correy'),('Corrina'),('Cortney'),('Courtenay'),('Crissie'),('Cristal'),('Cristin'),('Cristy'),('Cyb'),('Cybil'),('Cynthea'),('Dael'),('Dafna'),('Daisey'),('Dale'),('Dallas'),('Damita');
INSERT INTO tblNames (name) VALUES ('Danelle'),('Danica'),('Daniele'),('Danila'),('Danni'),('Danya'),('Daphna'),('Darbie'),('Darci'),('Dareen'),('Daria'),('Darlene'),('Darsie'),('Dasha'),('Datha'),('Davida'),('Dawn'),('Dea'),('Deanne'),('Debbra'),('Debi'),('Debra'),('Dee'),('Deedee'),('Deidre'),('Dela'),('Delia'),('Dell'),('Delores'),('Delphine'),('Demetria'),('Denice'),('Dennie'),('Denyse'),('Desirae'),('Devan'),('Devinne'),('Devonne'),('Diahann'),('Diandra'),('Diann'),('Didi'),('Dina'),('Dion'),('Dita'),('Dodi'),('Doll'),('Dolly'),('Doloritas'),('Donella'),('Donica'),('Donnamarie'),('Dora'),('Doralynn'),('Doreen'),('Dorena'),('Dorey'),('Dorice'),('Dorisa'),('Doro'),('Doroteya'),('Dorree'),('Dorry'),('Dosi'),('Dottie'),('Drew'),('Dulcia'),('Dulcinea'),('Dyan'),('Dyanna'),('Ealasaid'),('Ebba'),('Eddi'),('Edee'),('Edie'),('Editha'),('Edwina'),('Effie'),('Eirena'),('Elana'),('Elbertina'),('Eleanore'),('Eleni'),('Elfie'),('Elga'),('Elie'),('Elisabet'),('Elisha'),('Elizabet'),('Ella'),('Ellene'),('Ellissa'),('Elmira'),('Eloisa'),('Elsa'),('Elsi'),('Elsy'),('Elvira'),('Elyse'),('Elyssa'),('Emalia'),('Emelina'),('Emera'),('Emilie'),('Emlynn'),('Emmaline'),('Emmeline'),('Emmy'),('Emylee'),('Enrica'),('Enya'),('Erda'),('Ericka'),('Erinn'),('Ermentrude'),('Erna'),('Ertha'),('Esme'),('Essie'),('Estele'),('Ester'),('Ethel'),('Etheline'),('Etti'),('Eugenia'),('Eulalie'),('Eva'),('Evangelina'),('Eve'),('Evelyn'),('Evita'),('Evy'),('Fabrice'),('Fallon'),('Fancie'),('Fanni'),('Fara'),('Farra'),('Faun'),('Fawn'),('Fay'),('Fayina'),('Federica'),('Felice'),('Felipa'),('Fenelia'),('Fern'),('Ferne'),('Fidela'),('Fifine'),('Fina'),('Fiorenze'),('Flor'),('Florella'),('Florenza'),('Florice'),('Florinda'),('Florry'),('Flossy'),('Fran'),('Francesca'),('Francisca'),('Frank'),('Frannie');
INSERT INTO tblNames (name) VALUES ('Freda'),('Fredelia'),('Fredia'),('Frieda'),('Gabbi'),('Gabie'),('Gabriella'),('Gaby'),('Gale'),('Garnet'),('Gavrielle'),('Gayleen'),('Gen'),('Genevieve'),('Genni'),('Genovera'),('Georgeanne'),('Georgette'),('Georgianna'),('Georgine'),('Geraldine'),('Gerianna'),('Germaine'),('Gerrilee'),('Gerti'),('Gertrude'),('Giana'),('Gilberta'),('Gilda'),('Gillian'),('Gina'),('Ginni'),('Giorgia'),('Gisela'),('Gizela'),('Gladys'),('Glenine'),('Glennis'),('Gloriane'),('Glynda'),('Golda'),('Goldie'),('Gracia'),('Gratiana'),('Gredel'),('Gretchen'),('Gretna'),('Grissel'),('Guglielma'),('Guinevere'),('Gus'),('Gussy'),('Gusty'),('Gwendolyn'),('Gwenneth'),('Gwenora'),('Gwynne'),('Haily'),('Hali'),('Halli'),('Hanna'),('Hannie'),('Harlene'),('Harmonia'),('Harrie'),('Harriette'),('Hattie'),('Hazel'),('Hedda'),('Hedvig'),('Heide'),('Helaine'),('Helene'),('Hellene'),('Helyn'),('Henrieta'),('Hephzibah'),('Herminia'),('Hester'),('Hettie'),('Hilda'),('Hildegaard'),('Hilliary'),('Hollie'),('Honey'),('Horatia'),('Hyacinth'),('Hyacinthie'),('Ibby'),('Idaline'),('Ike'),('Ileane'),('Illa'),('Ilysa'),('Imogen'),('Inci'),('Inessa'),('Ingaborg'),('Inger'),('Ioana'),('Iormina'),('Irina'),('Isa'),('Isabella'),('Isadore'),('Isis'),('Issy'),('Ivonne'),('Izzi'),('Jacintha'),('Jackie'),('Jackqueline'),('Jacquelin'),('Jacquenetta'),('Jacqui'),('Jade'),('Jaleh'),('Jammie'),('Janaye'),('Janeczka'),('Janella'),('Janessa'),('Janette'),('Janice'),('Janine'),('Janna'),('Jany'),('Jaquenette'),('Jasmine'),('Jaynell'),('Jeane'),('Jeanine'),('Jeannie'),('Jemie'),('Jemmy'),('Jenelle'),('Jeniece'),('Jenine'),('Jennette'),('Jennifer'),('Jeraldine'),('Jermaine'),('Jerrine'),('Jessa'),('Jessamyn'),('Jessica'),('Jewel'),('Jillana'),('Jillene'),('Jilly'),('Jo-ann'),('Joan'),('Joann'),('Jobey');
INSERT INTO tblNames (name) VALUES ('Joby'),('Joceline'),('Jodi'),('Joelie'),('Joellen'),('Joete'),('Johnette'),('Jolee'),('Joli'),('Jolyn'),('Jonie'),('Jordana'),('Jorie'),('Josee'),('Josepha'),('Josi'),('Josy'),('Joyan'),('Joye'),('Jude'),('Juditha'),('Juli'),('Juliann'),('Julienne'),('Juliette'),('Julita'),('Junie'),('Justine'),('Kacy'),('Kaile'),('Kaitlynn'),('Kaleena'),('Kalina'),('Kally'),('Kamillah'),('Kanya'),('Karalynn'),('Karen'),('Karie'),('Karina'),('Karissa'),('Karleen'),('Karlotta'),('Karmen'),('Karole'),('Karon'),('Kary'),('Kasey'),('Kassi'),('Kat'),('Katee'),('Kath'),('Katharyn'),('Katherine'),('Kathleen'),('Kathryn'),('Kati'),('Katinka'),('Katrine'),('Katuscha'),('Kay'),('Kayle'),('Kaylyn'),('Keely'),('Kelcy'),('Kelli'),('Kellsie'),('Kelsi'),('Kenna'),('Kerianne'),('Kerrin'),('Keslie'),('Kettie'),('Ki'),('Kiele'),('Kim'),('Kimberly'),('Kimmie'),('Kipp'),('Kirbee'),('Kirsten'),('Kirstin'),('Kissie'),('Kitty'),('Klarika'),('Koo'),('Kordula'),('Koressa'),('Korrie'),('Krissie'),('Kristan'),('Kristi'),('Kristine'),('Krystal'),('Kyla'),('Kylila'),('Kyrstin'),('Lacie'),('Laila'),('Lana'),('Lani'),('Lanni'),('Lari'),('Larissa'),('Latia'),('Laura'),('Laure'),('Laurella'),('Lauretta'),('Laurice'),('Laverna'),('Lavinie'),('Lea'),('Leanna'),('Lebbie'),('Leeann'),('Leena'),('Leia'),('Leila'),('Lelah'),('Lenee'),('Lenora'),('Leola'),('Leone'),('Leonore'),('Leorah'),('Leslie'),('Lethia'),('Letta'),('Leyla'),('Liana'),('Lib'),('Libby'),('Lil'),('Lilia'),('Lilith'),('Lillis'),('Lilyan'),('Linda'),('Lindsey'),('Linell'),('Linnea'),('Linzy'),('Lisa'),('Lise'),('Lishe'),('Lissy'),('Liz'),('Lizette'),('Lois'),('Loleta'),('Lonee'),('Lonnie'),('Loralee'),('Loreen'),('Lorena'),('Lorettalorna'),('Lorianna'),('Lorilyn'),('Lorna'),('Lorri'),('Lory'),('Lottie'),('Louisa');
INSERT INTO tblNames (name) VALUES ('Luana'),('Lucia'),('Lucila'),('Lucinda'),('Lucretia'),('Luisa'),('Lulu'),('Lurleen'),('Lust'),('Lyn'),('Lyndell'),('Lyndy'),('Lynette'),('Lynnea'),('Lynnett'),('Lyssa'),('Mable'),('Maddalena'),('Madel'),('Madelene'),('Madella'),('Madge'),('Madonna'),('Mag'),('Magdalena'),('Maggie'),('Mahalia'),('Mair'),('Maisie'),('Malena'),('Malinde'),('Malkah'),('Malorie'),('Malynda'),('Mandi'),('Manya'),('Marcelia'),('Marcelline'),('Marcie'),('Mareah'),('Marga'),('Margareta'),('Margaretta'),('Marge'),('Margette'),('Marglerite'),('Marguerite'),('Maria'),('Mariann'),('Maribelle'),('Marie'),('Mariejeanne'),('Mariellen'),('Marijo'),('Marillin'),('Marinna'),('Marisa'),('Marita'),('Marja'),('Marjorie'),('Marla'),('Marleen'),('Marlie'),('Marna'),('Marnia'),('Marris'),('Marsiella'),('Martha'),('Martica'),('Marty'),('Maryangelyn'),('Marybelle'),('Maryjo'),('Marylinda'),('Marys'),('Mathilda'),('Matti'),('Maude'),('Maureen'),('Maurise'),('Max'),('Maxy'),('Mayda'),('Meagan'),('Meg'),('Meggi'),('Meghann'),('Mel'),('Melanie'),('Melesa'),('Melinda'),('Melisandra'),('Melisse'),('Melli'),('Mellisent'),('Melodee'),('Melony'),('Merci'),('Meredithe'),('Merilee'),('Merl'),('Merline'),('Merridie'),('Merrilee'),('Merry'),('Mia'),('Michaeline'),('Michele'),('Michelle'),('Midge'),('Miguelita'),('Milicent'),('Millicent'),('Milzie'),('Minda'),('Minette'),('Minny'),('Mirabel'),('Miranda'),('Mirelle'),('Misha'),('Misty'),('Modesta'),('Moina'),('Molli'),('Mona'),('Monique'),('Morgan'),('Morgen'),('Morna'),('Moyra'),('Mufinella'),('Muriel'),('Myrah'),('Myrle'),('Myrtia'),('Nadine'),('Nalani'),('Nance'),('Nancie'),('Nani'),('Nanni'),('Naoma'),('Nariko'),('Natalee'),('Nataline'),('Nathalia'),('Neala'),('Neely'),('Neille'),('Nell'),('Nelly'),('Nert'),('Nertie'),('Nessie');
INSERT INTO tblNames (name) VALUES ('Netti'),('Nevsa'),('Nicholle'),('Nicol'),('Nicolette'),('Nicolle'),('Nikki'),('Nil'),('Ninnetta'),('Nissa'),('Nita'),('Noel'),('Noelle'),('Nola'),('Nomi'),('Nonie'),('Norah'),('Norina'),('Norrie'),('Nydia'),('Odelia'),('Odessa'),('Odille'),('Ola'),('Olimpia'),('Olivie'),('Olva'),('Olympie'),('Onlea'),('Opaline'),('Ora'),('Oralla'),('Orelia'),('Oreste'),('Orsola'),('Othella'),('Pam'),('Pammi'),('Pansie'),('Parwane'),('Patrice'),('Patti'),('Paula-grace'),('Pauli'),('Paulita'),('Pearl'),('Peg'),('Peggy'),('Penni'),('Pepita'),('Perla'),('Perry'),('Petra');
INSERT INTO tblSurnames (surname) VALUES ('Smith'),('Johnson'),('Williams'),('Brown'),('Jones'),('Garcia'),('Miller'),('Davis'),('Rodriguez'),('Martinez'),('Hernandez'),('Lopez'),('Gonzalez'),('Wilson'),('Anderson'),('Thomas'),('Taylor'),('Moore'),('Jackson'),('Martin'),('Lee'),('Perez'),('Thompson'),('White'),('Harris'),('Sanchez'),('Clark'),('Ramirez'),('Lewis'),('Robinson'),('Walker'),('Young'),('Allen'),('King'),('Wright'),('Scott'),('Torres'),('Nguyen'),('Hill'),('Flores'),('Green'),('Adams'),('Nelson'),('Baker'),('Hall'),('Rivera'),('Campbell'),('Mitchell'),('Carter'),('Roberts'),('Gomez'),('Phillips'),('Evans'),('Turner'),('Diaz'),('Parker'),('Cruz'),('Edwards'),('Collins'),('Reyes'),('Stewart'),('Morris'),('Morales'),('Murphy'),('Cook'),('Rogers'),('Gutierrez'),('Ortiz'),('Morgan'),('Cooper'),('Peterson'),('Bailey'),('Reed'),('Kelly'),('Howard'),('Ramos'),('Kim'),('Cox'),('Ward'),('Richardson'),('Watson'),('Brooks'),('Chavez'),('Wood'),('James'),('Bennett'),('Gray'),('Mendoza'),('Ruiz'),('Hughes'),('Price'),('Alvarez'),('Castillo'),('Sanders'),('Patel'),('Myers'),('Long'),('Ross'),('Foster'),('Jimenez'),('Powell'),('Jenkins'),('Perry'),('Russell'),('Sullivan'),('Bell'),('Coleman'),('Butler'),('Henderson'),('Barnes'),('Gonzales'),('Fisher'),('Vasquez'),('Simmons'),('Romero'),('Jordan'),('Patterson'),('Alexander'),('Hamilton'),('Graham'),('Reynolds'),('Griffin'),('Wallace'),('Moreno'),('West'),('Cole'),('Hayes'),('Bryant'),('Herrera'),('Gibson'),('Ellis'),('Tran'),('Medina'),('Aguilar'),('Stevens'),('Murray'),('Ford'),('Castro'),('Marshall'),('Owens'),('Harrison'),('Fernandez'),('Mcdonald'),('Woods'),('Washington'),('Kennedy'),('Wells'),('Vargas'),('Henry'),('Chen'),('Freeman'),('Webb'),('Tucker'),('Guzman'),('Burns'),('Crawford'),('Olson'),('Simpson'),('Porter');
INSERT INTO tblSurnames (surname) VALUES ('Hunter'),('Gordon'),('Mendez'),('Silva'),('Shaw'),('Snyder'),('Mason'),('Dixon'),('Munoz'),('Hunt'),('Hicks'),('Holmes'),('Palmer'),('Wagner'),('Black'),('Robertson'),('Boyd'),('Rose'),('Stone'),('Salazar'),('Fox'),('Warren'),('Mills'),('Meyer'),('Rice'),('Schmidt'),('Garza'),('Daniels'),('Ferguson'),('Nichols'),('Stephens'),('Soto'),('Weaver'),('Ryan'),('Gardner'),('Payne'),('Grant'),('Dunn'),('Kelley'),('Spencer'),('Hawkins'),('Arnold'),('Pierce'),('Vazquez'),('Hansen'),('Peters'),('Santos'),('Hart'),('Bradley'),('Knight'),('Elliott'),('Cunningham'),('Duncan'),('Armstrong'),('Hudson'),('Carroll'),('Lane'),('Riley'),('Andrews'),('Alvarado'),('Ray'),('Delgado'),('Berry'),('Perkins'),('Hoffman'),('Johnston'),('Matthews'),('Pena'),('Richards'),('Contreras'),('Willis'),('Carpenter'),('Lawrence'),('Sandoval'),('Guerrero'),('George'),('Chapman'),('Rios'),('Estrada'),('Ortega'),('Watkins'),('Greene'),('Nunez'),('Wheeler'),('Valdez'),('Harper'),('Burke'),('Larson'),('Santiago'),('Maldonado'),('Morrison'),('Franklin'),('Carlson'),('Austin'),('Dominguez'),('Carr'),('Lawson'),('Jacobs'),('Obrien'),('Lynch'),('Singh'),('Vega'),('Bishop'),('Montgomery'),('Oliver'),('Jensen'),('Harvey'),('Williamson'),('Gilbert'),('Dean'),('Sims'),('Espinoza'),('Howell'),('Li'),('Wong'),('Reid'),('Hanson'),('Le'),('Mccoy'),('Garrett'),('Burton'),('Fuller'),('Wang'),('Weber'),('Welch'),('Rojas'),('Lucas'),('Marquez'),('Fields'),('Park'),('Yang'),('Little'),('Banks'),('Padilla'),('Day'),('Walsh'),('Bowman'),('Schultz'),('Luna'),('Fowler'),('Mejia'),('Davidson'),('Acosta'),('Brewer'),('May'),('Holland'),('Juarez'),('Newman'),('Pearson'),('Curtis'),('Cortez'),('Douglas'),('Schneider'),('Joseph'),('Barrett'),('Navarro'),('Figueroa'),('Keller'),('Avila'),('Wade');
INSERT INTO tblSurnames (surname) VALUES ('Molina'),('Stanley'),('Hopkins'),('Campos'),('Barnett'),('Bates'),('Chambers'),('Caldwell'),('Beck'),('Lambert'),('Miranda'),('Byrd'),('Craig'),('Ayala'),('Lowe'),('Frazier'),('Powers'),('Neal'),('Leonard'),('Gregory'),('Carrillo'),('Sutton'),('Fleming'),('Rhodes'),('Shelton'),('Schwartz'),('Norris'),('Jennings'),('Watts'),('Duran'),('Walters'),('Cohen'),('Mcdaniel'),('Moran'),('Parks'),('Steele'),('Vaughn'),('Becker'),('Holt'),('Deleon'),('Barker'),('Terry'),('Hale'),('Leon'),('Hail'),('Benson'),('Haynes'),('Horton'),('Miles'),('Lyons'),('Pham'),('Graves'),('Bush'),('Thornton'),('Wolfe'),('Warner'),('Cabrera'),('Mckinney'),('Mann'),('Zimmerman'),('Dawson'),('Lara'),('Fletcher'),('Page'),('Mccarthy'),('Love'),('Robles'),('Cervantes'),('Solis'),('Erickson'),('Reeves'),('Chang'),('Klein'),('Salinas'),('Fuentes'),('Baldwin'),('Daniel'),('Simon'),('Velasquez'),('Hardy'),('Higgins'),('Aguirre'),('Lin'),('Cummings'),('Chandler'),('Sharp'),('Barber'),('Bowen'),('Ochoa'),('Dennis'),('Robbins'),('Liu'),('Ramsey'),('Francis'),('Griffith'),('Paul'),('Blair'),('Oconnor'),('Cardenas'),('Pacheco'),('Cross'),('Calderon'),('Quinn'),('Moss'),('Swanson'),('Chan'),('Rivas'),('Khan'),('Rodgers'),('Serrano'),('Fitzgerald'),('Rosales'),('Stevenson'),('Christensen'),('Manning'),('Gill'),('Curry'),('Mclaughlin'),('Harmon'),('Mcgee'),('Gross'),('Doyle'),('Garner'),('Newton'),('Burgess'),('Reese'),('Walton'),('Blake'),('Trujillo'),('Adkins'),('Brady'),('Goodman'),('Roman'),('Webster'),('Goodwin'),('Fischer'),('Huang'),('Potter'),('Delacruz'),('Montoya'),('Todd'),('Wu'),('Hines'),('Mullins'),('Castaneda'),('Malone'),('Cannon'),('Tate'),('Mack'),('Sherman'),('Hubbard'),('Hodges'),('Zhang'),('Guerra'),('Wolf'),('Valencia'),('Franco'),('Saunders'),('Rowe');
INSERT INTO tblSurnames (surname) VALUES ('Gallagher'),('Farmer'),('Hammond'),('Hampton'),('Townsend'),('Ingram'),('Wise'),('Gallegos'),('Clarke'),('Barton'),('Schroeder'),('Maxwell'),('Waters'),('Logan'),('Camacho'),('Strickland'),('Norman'),('Person'),('Colon'),('Parsons'),('Frank'),('Harrington'),('Glover'),('Osborne'),('Buchanan'),('Casey'),('Floyd'),('Patton'),('Ibarra'),('Ball'),('Tyler'),('Suarez'),('Bowers'),('Orozco'),('Salas'),('Cobb'),('Gibbs'),('Andrade'),('Bauer'),('Conner'),('Moody'),('Escobar'),('Mcguire'),('Lloyd'),('Mueller'),('Hartman'),('French'),('Kramer'),('Mcbride'),('Pope'),('Lindsey'),('Velazquez'),('Norton'),('Mccormick'),('Sparks'),('Flynn'),('Yates'),('Hogan'),('Marsh'),('Macias'),('Villanueva'),('Zamora'),('Pratt'),('Stokes'),('Owen'),('Ballard'),('Lang'),('Brock'),('Villarreal'),('Charles'),('Drake'),('Barrera'),('Cain'),('Patrick'),('Pineda'),('Burnett'),('Mercado'),('Santana'),('Shepherd'),('Bautista'),('Ali'),('Shaffer'),('Lamb'),('Trevino'),('Mckenzie'),('Hess'),('Beil'),('Olsen'),('Cochran'),('Morton'),('Nash'),('Wilkins'),('Petersen'),('Briggs'),('Shah'),('Roth'),('Nicholson'),('Holloway'),('Lozano'),('Flowers'),('Rangel'),('Hoover'),('Arias'),('Short'),('Mora'),('Valenzuela'),('Bryan'),('Meyers'),('Weiss'),('Underwood'),('Bass'),('Greer'),('Summers'),('Houston'),('Carson'),('Morrow'),('Clayton'),('Whitaker'),('Decker'),('Yoder'),('Collier'),('Zuniga'),('Carey'),('Wilcox'),('Melendez'),('Poole'),('Roberson'),('Larsen'),('Conley'),('Davenport'),('Copeland'),('Massey'),('Lam'),('Huff'),('Rocha'),('Cameron'),('Jefferson'),('Hood'),('Monroe'),('Anthony'),('Pittman'),('Huynh'),('Randall'),('Singleton'),('Kirk'),('Combs'),('Mathis'),('Christian'),('Skinner'),('Bradford'),('Richard'),('Galvan'),('Wall'),('Boone'),('Kirby'),('Wilkinson');
INSERT INTO tblSurnames (surname) VALUES ('Bridges'),('Bruce'),('Atkinson'),('Velez'),('Meza'),('Roy'),('Vincent'),('York'),('Hodge'),('Villa'),('Abbott'),('Allison'),('Tapia'),('Gates'),('Chase'),('Sosa'),('Sweeney'),('Farrell'),('Wyatt'),('Dalton'),('Horn'),('Barron'),('Phelps'),('Yu'),('Dickerson'),('Heath'),('Foley'),('Atkins'),('Mathews'),('Bonilla'),('Acevedo'),('Benitez'),('Zavala'),('Hensley'),('Glenn'),('Cisneros'),('Harrell'),('Shields'),('Rubio'),('Choi'),('Huffman'),('Boyer'),('Garrison'),('Arroyo'),('Bond'),('Kane'),('Hancock'),('Callahan'),('Dillon'),('Cline'),('Wiggins'),('Grimes'),('Arellano'),('Melton'),('Oneill'),('Savage'),('Ho'),('Beltran'),('Pitts'),('Parrish'),('Ponce'),('Rich'),('Booth'),('Koch'),('Golden'),('Ware'),('Brennan'),('Mcdowell'),('Marks'),('Cantu'),('Humphrey'),('Baxter'),('Sawyer'),('Clay'),('Tanner'),('Hutchinson'),('Kaur'),('Berg'),('Wiley'),('Gilmore'),('Russo'),('Villegas'),('Hobbs'),('Keith'),('Wilkerson'),('Ahmed'),('Beard'),('Mcclain'),('Montes'),('Mata'),('Rosario'),('Vang'),('Walter'),('Henson'),('Oneal'),('Mosley'),('Mcclure'),('Beasley'),('Stephenson'),('Snow'),('Huerta'),('Preston'),('Vance'),('Barry'),('Johns'),('Eaton'),('Blackwell'),('Dyer'),('Prince'),('Macdonald'),('Solomon'),('Guevara'),('Stafford'),('English'),('Hurst'),('Woodard'),('Cortes'),('Shannon'),('Kemp'),('Nolan'),('Mccullough'),('Merritt'),('Murillo'),('Moon'),('Salgado'),('Strong'),('Kline'),('Cordova'),('Barajas'),('Roach'),('Rosas'),('Winters'),('Jacobson'),('Lester'),('Knox'),('Bullock'),('Kerr'),('Leach'),('Meadows'),('Davila'),('Orr'),('Whitehead'),('Pruitt'),('Kent'),('Conway'),('Mckee'),('Barr'),('David'),('Dejesus'),('Marin'),('Berger'),('Mcintyre'),('Blankenship'),('Gaines'),('Palacios'),('Cuevas'),('Bartlett'),('Durham'),('Dorsey');
INSERT INTO tblSurnames (surname) VALUES ('Mccall'),('Odonnell'),('Stein'),('Browning'),('Stout'),('Lowery'),('Sloan'),('Mclean'),('Hendricks'),('Calhoun'),('Sexton'),('Chung'),('Gentry'),('Hull'),('Duarte'),('Ellison'),('Nielsen'),('Gillespie'),('Buck'),('Middleton'),('Sellers'),('Leblanc'),('Esparza'),('Hardin'),('Bradshaw'),('Mcintosh'),('Howe'),('Livingston'),('Frost'),('Glass'),('Morse'),('Knapp'),('Herman'),('Stark'),('Bravo'),('Noble'),('Spears'),('Weeks'),('Corona'),('Frederick'),('Buckley'),('Mcfarland'),('Hebert'),('Enriquez'),('Hickman'),('Quintero'),('Randolph'),('Schaefer'),('Walls'),('Trejo'),('House'),('Reilly'),('Pennington'),('Michael'),('Conrad'),('Giles'),('Benjamin'),('Crosby'),('Fitzpatrick'),('Donovan'),('Mays'),('Mahoney'),('Valentine'),('Raymond'),('Medrano'),('Hahn'),('Mcmillan'),('Small'),('Bentley'),('Felix'),('Peck'),('Lucero'),('Boyle'),('Hanna'),('Pace'),('Rush'),('Hurley'),('Harding'),('Mcconnell'),('Bernal'),('Nava'),('Ayers'),('Everett'),('Ventura'),('Avery'),('Pugh'),('Mayer'),('Bender'),('Shepard'),('Mcmahon'),('Landry'),('Case'),('Sampson'),('Moses'),('Magana'),('Blackburn'),('Dunlap'),('Gould'),('Duffy'),('Vaughan'),('Herring'),('Mckay'),('Espinosa'),('Rivers'),('Farley'),('Bernard'),('Ashley'),('Friedman'),('Potts'),('Truong'),('Costa'),('Correa'),('Blevins'),('Nixon'),('Clements'),('Fry'),('Delarosa'),('Best'),('Benton'),('Lugo'),('Portillo'),('Dougherty'),('Crane'),('Haley'),('Phan'),('Villalobos'),('Blanchard'),('Horne'),('Finley'),('Quintana'),('Lynn'),('Esquivel'),('Bean'),('Dodson'),('Mullen'),('Xiong'),('Hayden'),('Cano'),('Levy'),('Huber'),('Richmond'),('Moyer'),('Lim'),('Frye'),('Sheppard'),('Mccarty'),('Avalos'),('Booker'),('Waller'),('Parra'),('Woodward'),('Jaramillo'),('Krueger'),('Rasmussen'),('Brandt'),('Peralta');
INSERT INTO tblSurnames (surname) VALUES ('Donaldson'),('Stuart'),('Faulkner'),('Maynard'),('Galindo'),('Coffey'),('Estes'),('Sanford'),('Burch'),('Maddox'),('Vo'),('Oconnell'),('Vu'),('Andersen'),('Spence'),('Mcpherson'),('Church'),('Schmitt'),('Stanton'),('Leal'),('Cherry'),('Compton'),('Dudley'),('Sierra'),('Pollard'),('Alfaro'),('Hester'),('Proctor'),('Lu'),('Hinton'),('Novak'),('Good'),('Madden'),('Mccann'),('Terrell'),('Jarvis'),('Dickson'),('Reyna'),('Cantrell'),('Mayo'),('Branch'),('Hendrix'),('Rollins'),('Rowland'),('Whitney'),('Duke'),('Odom');


-- =============================================================
-- tblNumbers population (safe, idempotent)
-- Generates integers 1..100000 using set-based cross joins.
-- =============================================================
INSERT IGNORE INTO tblNumbers (n)
SELECT a.N + b.N * 10 + c.N * 100 + d.N * 1000 + e.N * 10000 + 1
FROM (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
CROSS JOIN (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
CROSS JOIN (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
CROSS JOIN (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) d
CROSS JOIN (SELECT 0 N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) e
LIMIT 100000;


-- =============================================================
-- Lookup tables seed (fixed values, idempotent)
-- =============================================================
INSERT IGNORE INTO tblGender (genderName)
VALUES ('Female'), ('Male'), ('Non-binary'), ('Prefer not to say');

INSERT IGNORE INTO tblAgeGroup (label)
VALUES ('18-24'), ('25-34'), ('35-44'), ('45-54'), ('55+');

INSERT IGNORE INTO tblEmploymentStatus (label)
VALUES ('Unemployed'), ('Part-time'), ('Full-time'), ('Self-employed'), ('Student');

INSERT IGNORE INTO tblEducationLevel (label)
VALUES ('Primary'), ('Secondary'), ('Diploma'), ('Undergraduate'), ('Postgraduate');

INSERT IGNORE INTO tblMaritalStatus (label)
VALUES ('Single'), ('Married'), ('Divorced'), ('Widowed');

INSERT IGNORE INTO tblOutcomeType (typeName)
VALUES ('Knowledge Gain'), ('Employment Improvement'), ('Income Improvement'), ('Leadership Growth');

INSERT IGNORE INTO tblProgrammeStatus (statusName)
VALUES ('Planned'), ('Active'), ('Completed'), ('On Hold');

INSERT IGNORE INTO tblTeamSpecialisation (name)
VALUES ('Legal Reform'), ('Education'), ('Healthcare'), ('Economic Empowerment'), ('Anti-Violence');

INSERT IGNORE INTO tblCourseSkillCategory (name)
VALUES ('Legal Rights'), ('Health Education'), ('Financial Literacy'), ('Leadership'), ('Digital Skills');

INSERT IGNORE INTO tblFundingSource (sourceName, sourceType, contactEmail, isActive)
VALUES
('UN Women Programme Fund', 'UN', 'funding@unwomen.com', 1),
('Government Equality Grant', 'Government', 'grants@gov.com', 1),
('Global NGO Coalition', 'NGO', 'contact@globalngo.com', 1),
('Private Impact Partners', 'Private', 'hello@impactpartners.com', 1);

COMMIT; -- changed: commit all lookup/reference seeds before dependent entity inserts to enforce transaction ordering safety
START TRANSACTION; -- changed: start transaction 2 for entity/junction inserts that depend on committed parent rows


-- =============================================================
-- Core entity seeds
-- =============================================================
INSERT INTO tblRegion (regionName, countryID, areaType, populationSize, createdAt)
SELECT
	CONCAT(
		ELT(1 + (n.n % 15),
			'Nairobi', 'Kampala', 'Lagos', 'Accra', 'Dar es Salaam',
			'Kigali', 'Lusaka', 'Harare', 'Addis Ababa', 'Dakar',
			'Bamako', 'Conakry', 'Mogadishu', 'Lilongwe', 'Maputo'
		),
		' ',
		ELT(1 + ((n.n + 3) % 4), 'North', 'South', 'East', 'West'),
		' ',
		ELT(1 + ((n.n + 7) % 3), 'District', 'Province', 'Region'),
		' (ID-', LPAD(n.n, 3, '0'), ')'
	),
	c.countryID,
	ELT(1 + (n.n % 3), 'Urban', 'Rural', 'Suburban'),
	1000 + (((n.n * 9301 + 49297) % 233280) % 500000),
	NOW()
FROM tblNumbers n
JOIN (
	SELECT countryID,
	       ROW_NUMBER() OVER () AS rn
	FROM tblCountry
) c
	ON c.rn = ((n.n - 1) % (SELECT COUNT(*) FROM tblCountry)) + 1
WHERE n.n <= @seed_region;


-- =============================================================
-- tblTeam
-- =============================================================
INSERT INTO tblTeam (teamName, specialisationID)
SELECT
	CONCAT(
		ELT(1 + (n.n % 8),
			'Advocacy', 'Outreach', 'Training', 'Support',
			'Research', 'Community', 'Legal Aid', 'Health'
		),
		' & ',
		ELT(1 + ((n.n + 4) % 6),
			'Empowerment', 'Education', 'Development',
			'Awareness', 'Protection', 'Engagement'
		),
		' Team ',
		(n.n % 5) + 1,
		'-', LPAD(n.n, 3, '0')
	),
	ts.specialisationID
FROM tblNumbers n
JOIN (
	SELECT specialisationID,
	       ROW_NUMBER() OVER () AS rn
	FROM tblTeamSpecialisation
) ts
	ON ts.rn = ((n.n - 1) % (SELECT COUNT(*) FROM tblTeamSpecialisation)) + 1
WHERE n.n <= @seed_team;


-- =============================================================
-- tblCourse
-- =============================================================
INSERT INTO tblCourse (courseName, categoryID, durationHours, difficultyLevel, createdAt)
SELECT
	CONCAT(
		ELT(1 + (n.n % 10),
			'Introduction to Legal Rights',
			'Financial Literacy Fundamentals',
			'Leadership Skills for Women',
			'Digital Skills and Online Safety',
			'Health and Reproductive Rights',
			'Microfinance and Savings',
			'Conflict Resolution Techniques',
			'Civic Engagement and Voting Rights',
			'Entrepreneurship Essentials',
			'Gender-Based Violence Awareness'
		),
		': ',
		ELT(1 + ((n.n + 2) % 4),
			'Foundation', 'Core', 'Advanced', 'Masterclass'
		),
		' (',
		ELT(1 + ((n.n + 5) % 4), 'Spring', 'Summer', 'Autumn', 'Winter'),
		' ',
		(2020 + (n.n % 5)),
		')',
		'-', LPAD(n.n, 3, '0')
	),
	((n.n - 1) % (SELECT COUNT(*) FROM tblCourseSkillCategory)) + 1, -- changed: use (n.n - 1) modulo form to guarantee FK ID range starts at 1
	(n.n % 40) + 1,
	ELT(1 + (n.n % 3), 'Beginner', 'Intermediate', 'Advanced'),
	NOW()
FROM tblNumbers n
WHERE n.n <= @seed_course;


-- =============================================================
-- tblBeneficiary
-- =============================================================
INSERT INTO tblBeneficiary (
	firstName,
	lastName,
	genderID,
	ageGroupID,
	employmentStatusID,
	educationLevelID,
	maritalStatusID,
	phone,
	consentGiven,
	regionID,
	registrationDate,
	createdAt
)
SELECT
	fn.name,
	sn.surname,
	((n.n - 1) % (SELECT COUNT(*) FROM tblGender)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblAgeGroup)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblEmploymentStatus)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblEducationLevel)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblMaritalStatus)) + 1,
	CONCAT('+44', LPAD(((n.n * 9301 + 49297) % 233280), 9, '0')),
	(n.n % 2),
	((n.n - 1) % (SELECT COUNT(*) FROM tblRegion)) + 1,
	DATE_SUB(CURRENT_DATE, INTERVAL (n.n % 3650) DAY),
	NOW()
FROM tblNumbers n
JOIN tblNames fn
  ON fn.nameID = ((n.n - 1) % (SELECT COUNT(*) FROM tblNames)) + 1
JOIN tblSurnames sn
  ON sn.surnameID = ((n.n - 1) % (SELECT COUNT(*) FROM tblSurnames)) + 1
WHERE n.n <= @seed_beneficiary;


-- =============================================================
-- tblStaff
-- =============================================================
INSERT INTO tblStaff (
	firstName,
	lastName,
	email,
	phone,
	gender,
	role,
	certifiedDate,
	isActive,
	teamID,
	regionID,
	createdAt
)
SELECT
	fn.name,
	sn.surname,
	CONCAT('staff', n.n, '@example.com'),
	CONCAT('+44', LPAD(((n.n * 9301 + 49297) % 233280), 9, '0')),
	ELT(1 + (n.n % 4), 'Female', 'Male', 'Non-binary', 'Prefer not to say'),
	ELT(1 + (n.n % 3), 'Coordinator', 'Trainer', 'Volunteer'),
	DATE_SUB(CURRENT_DATE, INTERVAL (n.n % 3000) DAY),
	1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblTeam)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblRegion)) + 1,
	NOW()
FROM tblNumbers n
JOIN tblNames fn
  ON fn.nameID = ((n.n - 1) % (SELECT COUNT(*) FROM tblNames)) + 1
JOIN tblSurnames sn
  ON sn.surnameID = ((n.n - 1) % (SELECT COUNT(*) FROM tblSurnames)) + 1
WHERE n.n <= @seed_staff;


-- =============================================================
-- tblProgramme
-- =============================================================
INSERT INTO tblProgramme (
	programmeName,
	regionID,
	teamID,
	startDate,
	endDate,
	budget,
	objectives,
	statusID,
	focusArea,
	createdAt
)
SELECT
	CONCAT(
		ELT(1 + (n.n % 10),
			'Safe Futures Initiative',
			'Women in Leadership',
			'Economic Empowerment Project',
			'Girls Education Drive',
			'Anti-Violence Outreach',
			'Legal Rights Awareness',
			'Community Health Programme',
			'Financial Independence Campaign',
			'Political Participation Push',
			'End FGM Coalition'
		),
		' - ',
		ELT(1 + ((n.n * 3 + 7) % 15),
			'Kenya', 'Uganda', 'Nigeria', 'Ghana', 'Tanzania',

			'Rwanda', 'Zambia', 'Zimbabwe', 'Ethiopia', 'Senegal',
			'Mali', 'Guinea', 'Malawi', 'Mozambique', 'Somalia'
		),
		' ',
		(2020 + (n.n % 5)),
		' Phase ',
		(n.n % 3) + 1,
		'-', LPAD(n.n, 4, '0')
	),
	((n.n - 1) % (SELECT COUNT(*) FROM tblRegion)) + 1, -- changed: avoid zero-offset modulo edge and keep FK values strictly within [1..COUNT]
	((n.n - 1) % (SELECT COUNT(*) FROM tblTeam)) + 1, -- changed: avoid zero-offset modulo edge and keep FK values strictly within [1..COUNT]
	DATE_ADD('2020-01-01', INTERVAL (n.n % 1200) DAY),
	CASE
		WHEN (n.n % 5) = 0 THEN NULL
		ELSE DATE_ADD(DATE_ADD('2020-01-01', INTERVAL (n.n % 1200) DAY), INTERVAL ((n.n % 240) + 30) DAY)
	END,
	((n.n * 9301 + 49297) % 233280) + 1000,
	ELT(1 + (n.n % 6),
		'Increase awareness of legal rights among women in rural communities',
		'Reduce incidence of gender-based violence through education and outreach',
		'Improve economic independence through microfinance and skills training',
		'Strengthen political participation and civic engagement among women',
		'Eliminate harmful traditional practices through community-led advocacy',
		'Improve access to healthcare and reproductive rights information'
	),
	((n.n - 1) % (SELECT COUNT(*) FROM tblProgrammeStatus)) + 1, -- changed: use safe modulo mapping so status FK always resolves to an existing row
	ELT(1 + (n.n % 5), 'Child Marriage', 'FGM', 'Economic Empowerment', 'Political Participation', 'Anti-Violence'),
	NOW()
FROM tblNumbers n
WHERE n.n <= @seed_programme;


-- =============================================================
-- tblProgrammeCourse
-- =============================================================
INSERT INTO tblProgrammeCourse (programmeID, courseID, createdAt)
SELECT
	pairs.programmeID,
	pairs.courseID,
	NOW()
FROM (
	SELECT
		p.programmeID,
		c.courseID,
		ROW_NUMBER() OVER (ORDER BY p.programmeID, c.courseID) AS rn
	FROM tblProgramme p
	CROSS JOIN tblCourse c
	WHERE ((p.programmeID + c.courseID) % 3) = 0
) pairs
WHERE pairs.rn <= @seed_programmecourse; -- changed: row_number slice over explicit programme-course pairs guarantees uniqueness under UNIQUE(programmeID,courseID)


-- =============================================================
-- tblProgrammeFunding
-- =============================================================
INSERT IGNORE INTO tblProgrammeFunding (
	programmeID,
	sourceID,
	amount,
	startDate,
	endDate,
	createdAt
)
SELECT
	((n.n - 1) % (SELECT COUNT(*) FROM tblProgramme)) + 1, -- changed: safe modulo mapping for FK range correctness
	((n.n - 1) % (SELECT COUNT(*) FROM tblFundingSource)) + 1, -- changed: safe modulo mapping for FK range correctness
	(((n.n * 9301 + 49297) % 49) + 1) * 10000,
	DATE_ADD('2024-01-01', INTERVAL n.n DAY),
	CASE
		WHEN (n.n % 5) IN (0,1,2) THEN DATE_ADD('2025-01-01', INTERVAL ((n.n % 400) + 30) DAY)
		ELSE DATE_ADD('2023-01-01', INTERVAL ((n.n % 300) + 30) DAY)
	END,
	NOW()
FROM tblNumbers n
WHERE n.n <= @seed_programmefunding; -- changed: INSERT IGNORE prevents rare composite PK collisions on (programmeID, sourceID, startDate)


-- =============================================================
-- tblEnrolment
-- =============================================================
INSERT IGNORE INTO tblEnrolment (
	beneficiaryID,
	pcID,
	enrolDate,
	completionStatus,
	dropReason,
	preAssessmentScore,
	postAssessmentScore,
	certificateIssued,
	createdAt
)
SELECT
	((n.n * 7 - 1) % (SELECT COUNT(*) FROM tblBeneficiary)) + 1,
	((n.n - 1) % (SELECT COUNT(*) FROM tblProgrammeCourse)) + 1,
	DATE_ADD('2022-01-01', INTERVAL (n.n % 730) DAY),
	CASE
		WHEN (n.n % 100) < 60 THEN 'Completed'
		WHEN (n.n % 100) < 82 THEN 'Enrolled'
		ELSE 'Dropped'
	END,
	CASE WHEN (n.n % 100) >= 90 THEN ELT(1 + (n.n % 6),
		'Relocated to another region',
		'Personal or family circumstances',
		'Health issues prevented attendance',
		'Work or employment commitments',
		'Childcare responsibilities',
		'withdrew due to safety concerns'
	) ELSE NULL END,
	30 + ((n.n * 7) % 51),
	LEAST(100, (30 + ((n.n * 7) % 51)) + 5 + ((n.n * 13) % 26)),
	CASE WHEN (n.n % 100) < 60 THEN 1 ELSE 0 END,
	NOW()
FROM tblNumbers n
WHERE n.n <= LEAST(
	@seed_enrolment,
	(SELECT COUNT(*) FROM tblBeneficiary) * (SELECT COUNT(*) FROM tblProgrammeCourse)
);



-- =============================================================
-- tblSession
-- =============================================================
INSERT INTO tblSession (
	pcID,
	sessionDate,
	venue,
	durationMinutes,
	notes,
	createdAt
)
SELECT
	((n.n - 1) % (SELECT COUNT(*) FROM tblProgrammeCourse)) + 1, -- changed: safe modulo mapping to prevent zero-offset FK generation
	DATE_ADD('2022-01-01', INTERVAL (n.n % 365) DAY),
	CONCAT(
		ELT(1 + (n.n % 8),
			'Community Hall', 'District Office', 'Local School',
			'Health Centre', 'Church Hall', 'NGO Field Office',
			'Village Meeting Point', 'Women`s Centre'
		),
		' ',
		(n.n % 20) + 1
	),
	(n.n % 180) + 30,
	NULL,
	NOW()
FROM tblNumbers n
WHERE n.n <= @seed_session;


-- =============================================================
-- tblSessionStaff
-- =============================================================
SET @sql = CONCAT(
	'INSERT IGNORE INTO tblSessionStaff (sessionID, staffID, roleInSession, createdAt) ',
	'SELECT s.sessionID, ',
	'CASE ro.offs ',
	'WHEN 1 THEN (s.sessionID * 7  % (SELECT COUNT(*) FROM tblStaff)) + 1 ',
	'WHEN 2 THEN (s.sessionID * 13 % (SELECT COUNT(*) FROM tblStaff)) + 1 ',
	'WHEN 3 THEN (s.sessionID * 19 % (SELECT COUNT(*) FROM tblStaff)) + 1 ',
	'WHEN 4 THEN (s.sessionID * 23 % (SELECT COUNT(*) FROM tblStaff)) + 1 ',
	'END AS staffID, ',
	'ro.roleName, NOW() ',
	'FROM tblSession s ',
	'CROSS JOIN ( ',
	'SELECT 1 AS offs, ''Lead Trainer'' AS roleName UNION ALL ',
	'SELECT 2, ''Coordinator'' UNION ALL ',
	'SELECT 3, ''Co-Trainer'' UNION ALL ',
	'SELECT 4, ''Observer'' ',
	') ro ',
	'WHERE ro.offs <= 2 ',
	'OR (ro.offs = 3 AND s.sessionID % 2 = 0) ',
	'OR (ro.offs = 4 AND s.sessionID % 5 = 0) ',
	'LIMIT ', @seed_sessionstaff
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- =============================================================
-- tblAttendance
-- =============================================================
INSERT INTO tblAttendance (
	enrolmentID,
	sessionID,
	attended,
	createdAt
)
SELECT
	e.enrolmentID,
	s.sessionID,
	(((e.enrolmentID * 13) + s.sessionID) % 100) < 65,
	NOW()
FROM tblEnrolment e
JOIN tblSession s
	ON s.pcID = e.pcID
WHERE (((e.enrolmentID * 13) + s.sessionID) % 100) < 75
  AND ((((e.enrolmentID * 9301) + (s.sessionID * 49297)) % 233280) + 1) <= @seed_attendance;

-- =============================================================
-- tblOutcome
-- =============================================================
INSERT INTO tblOutcome (
	beneficiaryID,
	pcID,
	outcomeTypeID,
	outcomeValue,
	outcomeScore,
	outcomeDate,
	verified,
	verificationSource,
	notes
)
SELECT
	((e.enrolmentID * 7 - 1) % (SELECT COUNT(*) FROM tblBeneficiary)) + 1,
	e.pcID,
	((e.enrolmentID - 1) % (SELECT COUNT(*) FROM tblOutcomeType)) + 1,
	CASE ((e.enrolmentID - 1) % 4) + 1
		WHEN 1 THEN 'Improved understanding of legal rights and protections'
		WHEN 2 THEN ELT(1 + (e.enrolmentID % 3),
					'Gained full-time employment',
					'Promoted at current job',
					'Returned to workforce after absence')
		WHEN 3 THEN ELT(1 + (e.enrolmentID % 2),
					'Income increased by 10-25% within six months',
					'Started an income-generating activity')
		WHEN 4 THEN ELT(1 + (e.enrolmentID % 2),
					'Joined a community leadership role',
					'Completed certified leadership training')
	END,
	((e.enrolmentID * 9301 + 49297) % 101),
	DATE_ADD('2023-01-01', INTERVAL (e.enrolmentID % 365) DAY),
	((e.enrolmentID % 100) < 60),
	ELT(1 + (e.enrolmentID % 4), 'SelfReported', 'NGO', 'Government', 'ThirdParty'),
	NULL
FROM tblEnrolment e
JOIN tblNumbers n
	ON n.n = ((e.enrolmentID * 9301 + 49297) % 233280) + 1
WHERE n.n <= @seed_outcome;

COMMIT;

