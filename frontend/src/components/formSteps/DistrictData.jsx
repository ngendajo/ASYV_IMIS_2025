

const districts = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana', 'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'];

const sectorsByDistrict = {
    'Gasabo':[
     'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
     'Jali', 'Kacyiru', 'Kimihurura', 'Kimiromko', 'Kinyinya',
     'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga'
   ],
   'Kicukiro':['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'],
   'Nyarugenge':[
     'Gitega', 'Kanyinya', 'Kigali', 'Kimisagara',
     'Mageragere', 'Muhima', 'Nyakabanda', 'Nyamirambo',
     'Nyarugenge', 'Rwezamenyo'
   ],
   'Burera':['Bungwe','Butaro','Cyanika','Cyeru','Gahunga','Gatebe','Gitovu','Kagogo','Kinoni','Kinyababa','Kivuye','Nemba','Rugarama','Rugengabari','Ruhunde','Rusarabuye','Rwerere'],
   'Gakenke':[
     'Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga',
     'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe',
     'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'
   ],
   'Gicumbi':[
     'Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kageyo', 'Kaniga', 'Manyagiro',
     'Miyove', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya',
     'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko', 'Shangasha'
   ],
   'Musanze':['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'],
   'Rulindo':[
     'Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo',
     'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma',
     'Ntarabana', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba'
   ],
   'Gisagara':["Gikonko", "Gishubi", "Kansi", "Kibirizi", "Kigembe", "Mamba", "Muganza", "Mugombwa", "Mukingo", "Musha", "Ndora", "Nyanza", "Save"],
   'Huye':['Gishamvu', 'Huye', 'Karama', 'Kigoma', 'Kinazi', 'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusatira', 'Rwaniro', 'Simbi', 'Tumba'],
   'Kamonyi':[
     'Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina',
     'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugarika',
     'Rukoma', 'Runda'
   ],
   'Muhanga':[
     'Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga',
     'Mushishiro', 'Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi',
     'Rugendabari', 'Shyogwe'
   ],
   'Nyamagabe':[
     'Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha',
     'Kamegeri', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi',
     'Mugano', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane',
     'Tare', 'Uwinkingi'
   ],
   'Nyanza':[
     'Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kigoma',
     'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'
   ],
   'Nyaruguru':[
     'Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Mata',
     'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata',
     'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge'
   ],
   'Ruhango':['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango'], 
   'Bugesera':['Gashora','Juru','Kamabuye','Mareba','Mayange','Musenyi','Mwogo','Ngeruka','Ntarama','Nyamata','Nyarugenge','Rilima','Ruhuha','Rweru','Shyara'],
    'Gatsibo':['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'],
   'Kayonza':[
     'Gahini', 'Kabare', 'Kabarondo',
     'Mukarange', 'Murama', 'Murundi',
     'Mwiri', 'Ndego', 'Nyamirama',
     'Rukara', 'Ruramira', 'Rwinkwavu'
   ],
   'Kirehe':['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye'],
   'Ngoma':['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza'],
   'Nyagatare':[
     'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Kiyombe',
     'Matimba', 'Mimuri', 'Mukama', 'Musheri', 'Nyagatare',
     'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'
   ],
   'Rwamagana':[
     "Fumbwe", "Gahengeri", "Gishali", "Karenge", "Kigabiro", "Muhazi",
     "Munyaga", "Munyiginya", "Musha", "Muyumbu", "Mwulire", "Nyakaliro",
     "Nzige", "Rubona"
   ],
    'Karongi':[
     'Bwishyura', 'Gishari', 'Gishyita', 'Gitesi', 'Mubuga', 'Murambi',
     'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba'
   ],
   'Ngororero':[
     'Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo',
     'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro',
     'Ngororero', 'Nyange', 'Sovu'
   ],
   'Nyabihu':['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira'],
   'Nyamasheke':[
     'Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano',
     'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba',
     'Mahembe', 'Nyabitekeri', 'Rangiro', 'Ruharambuga', 'Shangi'
   ], 
   'Rubavu':[
     'Bugeshi', 'Busasamana', 'Cyanzarwe',
     'Gisenyi', 'Kanama', 'Kanzenze',
     'Mudende', 'Nyakiriba', 'Nyamyumba',
     'Nyundo', 'Rubavu', 'Rugerero'
   ],
   'Rusizi':[
     'Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe',
     'Gikundamvura', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka',
     'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo'
   ],
   'Rutsiro':['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya'], 
 };

export { districts, sectorsByDistrict };