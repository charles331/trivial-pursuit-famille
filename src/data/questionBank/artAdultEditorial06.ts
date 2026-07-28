import { Question } from '../../types';

type Fact = [string, string, string, string, string, string];

const FACTS: Fact[] = [
  ['Quel site malien est célèbre pour sa grande mosquée reconstruite en terre crue ?', 'Djenné', 'Tombouctou', 'Gao', 'Ségou', 'La Grande Mosquée de Djenné, dans sa forme actuelle de 1907, est entretenue par des enduits réguliers.'],
  ['Quel peuple du Mali est connu pour ses masques kanaga utilisés lors des cérémonies dama ?', 'Les Dogon', 'Les Bambara', 'Les Sénoufo', 'Les Baoulé', 'Le masque kanaga dogon porte une structure en double croix et intervient dans des rites funéraires.'],
  ['Quel royaume africain produisit des plaques de bronze pour décorer son palais royal ?', 'Le royaume du Bénin', 'Le royaume du Kongo', 'L’Empire du Mali', 'Le royaume de Koush', 'Les plaques du Bénin, réalisées dès le XVIe siècle, documentent la cour de l’oba.'],
  ['Dans quelle ville nigériane furent créées des têtes en laiton au naturalisme remarquable ?', 'Ifé', 'Kano', 'Lagos', 'Abeokuta', 'Les têtes d’Ifé, datées surtout des XIIe-XVe siècles, représentent probablement des figures de haut rang.'],
  ['Quel peuple de Côte d’Ivoire est associé aux masques-portraits mblo ?', 'Les Baoulé', 'Les Fang', 'Les Dan', 'Les Yoruba', 'Les masques mblo baoulé idéalisent des personnes reconnues de la communauté.'],
  ['Quel reliquaire africain est gardé par une figure sculptée appelée eyema-o-byeri ?', 'Le byeri fang', 'Le kota mbulu-ngulu', 'Le boli bambara', 'Le nkisi kongo', 'Chez les Fang, la figure de gardien protégeait une boîte contenant des reliques ancestrales.'],
  ['Quel type de sculpture kongo contient des charges rituelles et parfois des clous ?', 'Un nkisi nkondi', 'Un ibeji', 'Un akua’ba', 'Un chi wara', 'Le nkisi nkondi servait notamment à sceller des accords ou poursuivre symboliquement des malfaiteurs.'],
  ['Quel textile royal ghanéen est tissé en bandes aux couleurs et motifs codifiés ?', 'Le kente', 'Le bogolan', 'Le raphia kuba', 'L’adinkra', 'Le kente est particulièrement associé aux cours ashanti et ewe du Ghana.'],
  ['Quelle technique malienne décore le tissu avec une boue fermentée ?', 'Le bogolan', 'Le batik', 'L’ikat', 'Le shibori', 'Le bogolanfini bambara utilise des réactions entre tanins végétaux et boue riche en fer.'],
  ['Quel peuple de République démocratique du Congo créa des étoffes de raphia géométriques ?', 'Les Kuba', 'Les Luba', 'Les Lega', 'Les Mangbetu', 'Les textiles kuba combinent broderie, appliqué et velours de raphia dans des motifs complexes.'],
  ['Quel terme japonais désigne les estampes du « monde flottant » ?', 'Ukiyo-e', 'Sumi-e', 'Yamato-e', 'Nihonga', 'Les ukiyo-e représentent acteurs, courtisanes et paysages de l’époque d’Edo.'],
  ['Quel artiste japonais réalisa la série « Trente-six vues du mont Fuji » ?', 'Katsushika Hokusai', 'Utagawa Hiroshige', 'Kitagawa Utamaro', 'Tōshūsai Sharaku', 'La Grande Vague de Kanagawa appartient à cette série publiée au début des années 1830.'],
  ['Qui créa la série d’estampes « Les Cinquante-trois Stations du Tōkaidō » ?', 'Utagawa Hiroshige', 'Katsushika Hokusai', 'Suzuki Harunobu', 'Kawanabe Kyōsai', 'Hiroshige représenta les étapes de la grande route reliant Edo à Kyoto.'],
  ['Quel art japonais consiste à réparer une céramique avec une laque souvent poudrée d’or ?', 'Le kintsugi', 'Le raku', 'Le netsuke', 'Le kirigami', 'Le kintsugi souligne la fracture au lieu de la dissimuler, en utilisant la laque urushi.'],
  ['Quel petit objet sculpté japonais servait d’attache à la ceinture du kimono ?', 'Un netsuke', 'Un inrō', 'Un tsuba', 'Un okimono', 'Le netsuke retenait par un cordon une boîte ou une blague à tabac suspendue à l’obi.'],
  ['Quel type de jardin japonais utilise pierres et gravier ratissé avec très peu de végétation ?', 'Le kare-sansui', 'Le roji', 'Le kaiyū-shiki', 'Le tsubo-niwa', 'Le jardin sec de Ryōan-ji à Kyoto est un exemple célèbre de kare-sansui.'],
  ['Quelle tradition chinoise emploie pinceau, encre noire et papier selon les principes de la calligraphie ?', 'La peinture lettrée', 'L’émail cloisonné', 'La laque sculptée', 'La peinture de cour polychrome', 'La peinture des lettrés valorise l’expression du geste et associe souvent poésie, peinture et calligraphie.'],
  ['Quel rouleau chinois est conçu pour être déroulé horizontalement section après section ?', 'Le rouleau manuel', 'Le rouleau suspendu', 'Le paravent', 'L’album en éventail', 'Le rouleau manuel, ou handscroll, propose une expérience visuelle progressive et intime.'],
  ['Quelle dynastie chinoise est célèbre pour ses céramiques bleu et blanc exportées mondialement ?', 'La dynastie Ming', 'La dynastie Han', 'La dynastie Tang', 'La dynastie Qin', 'Les fours impériaux de Jingdezhen développèrent sous les Ming une vaste production de porcelaines.'],
  ['Quel matériau colorant donne le bleu aux porcelaines chinoises bleu et blanc ?', 'Le cobalt', 'Le cuivre', 'Le manganèse', 'Le fer', 'Le pigment de cobalt résiste à la cuisson à haute température sous la couverte.'],
  ['Quel monument indien est un stupa bouddhique agrandi sous les Maurya et les Shunga ?', 'Le grand stupa de Sanchi', 'Le temple de Khajuraho', 'Le Qûtb Minâr', 'Le temple du Soleil de Konarak', 'Les portails sculptés de Sanchi racontent la vie du Bouddha sans le représenter directement sous forme humaine.'],
  ['Quel ensemble indien est célèbre pour ses grottes bouddhiques peintes ?', 'Ajanta', 'Ellora', 'Elephanta', 'Badami', 'Les peintures murales d’Ajanta illustrent notamment les vies antérieures du Bouddha.'],
  ['Quel empereur moghol fit bâtir le Fort Rouge de Delhi ?', 'Shah Jahan', 'Akbar', 'Babur', 'Aurangzeb', 'Shah Jahan transféra sa capitale à Shahjahanabad et fit construire le fort à partir de 1639.'],
  ['Quel type de miniature se développa à la cour des empereurs moghols ?', 'La miniature moghole', 'La peinture madhubani', 'Le kalamkari', 'La peinture warli', 'Les ateliers moghols combinèrent traditions persanes et observation naturaliste indienne.'],
  ['Quel temple cambodgien est entouré d’un vaste fossé et de galeries sculptées ?', 'Angkor Wat', 'Borobudur', 'Prambanan', 'Bagan', 'Angkor Wat fut construit au XIIe siècle pour Suryavarman II et dédié initialement à Vishnou.'],
  ['Quel monument indonésien forme un mandala bouddhique en terrasses sur l’île de Java ?', 'Borobudur', 'Prambanan', 'Angkor Thom', 'Pagan', 'Borobudur comporte des centaines de reliefs narratifs et de stupas perforés.'],
  ['Quel complexe birman rassemble des milliers de temples dans la plaine de l’Irrawaddy ?', 'Bagan', 'Mandalay', 'Mrauk U', 'Pégou', 'La plupart des monuments de Bagan furent construits entre les XIe et XIIIe siècles.'],
  ['Quel temple javanais est le plus grand sanctuaire hindou d’Indonésie ?', 'Prambanan', 'Borobudur', 'Besakih', 'Tanah Lot', 'Prambanan fut édifié au IXe siècle et ses principaux sanctuaires honorent Shiva, Vishnou et Brahma.'],
  ['Quelle cité perse est célèbre pour les reliefs de son escalier de l’Apadana ?', 'Persépolis', 'Pasargades', 'Suse', 'Ecbatane', 'Les reliefs de Persépolis montrent des délégations de l’empire achéménide apportant des présents.'],
  ['Quel art islamique assemble de petites pièces de faïence taillées en motifs géométriques ?', 'Le zellige', 'Le stuc', 'La marqueterie', 'Le sgraffite', 'Le zellige est particulièrement développé dans l’architecture du Maghreb et d’al-Andalus.'],
  ['Quel manuscrit mésoaméricain plié en accordéon est appelé codex ?', 'Un livre peint précolombien', 'Une stèle gravée', 'Un textile noué', 'Une tablette d’argile', 'Les codex mayas et mixtèques combinaient signes calendaires, images et récits dynastiques.'],
  ['Quel peuple mésoaméricain sculpta de monumentales têtes en basalte ?', 'Les Olmèques', 'Les Toltèques', 'Les Zapotèques', 'Les Totonaques', 'Les têtes colossales olmèques représentent probablement des dirigeants portant des coiffes.'],
  ['Quel site maya possède le temple appelé « El Castillo » ?', 'Chichén Itzá', 'Palenque', 'Tikal', 'Copán', 'La pyramide de Kukulcán à Chichén Itzá combine fonctions rituelles et références calendaires.'],
  ['Quelle cité maya du Guatemala est dominée par de hauts temples-pyramides au cœur de la forêt ?', 'Tikal', 'Uxmal', 'Bonampak', 'Quiriguá', 'Tikal fut l’un des grands centres politiques des basses terres mayas classiques.'],
  ['Quel peuple andin réalisa de grands géoglyphes dans le désert péruvien ?', 'Les Nazcas', 'Les Mochicas', 'Les Chimús', 'Les Chachapoyas', 'Les lignes de Nazca furent tracées en retirant les pierres sombres de la surface désertique.'],
  ['Quelle civilisation péruvienne construisit la cité de Chan Chan ?', 'Les Chimús', 'Les Mochicas', 'Les Incas', 'Les Paracas', 'Chan Chan, capitale chimú, est un vaste ensemble urbain construit principalement en adobe.'],
  ['Quel textile andin utilise des fils teints avant tissage pour créer des motifs floutés ?', 'L’ikat', 'Le batik', 'La tapisserie fendue', 'Le brocart lancé', 'Dans l’ikat, la réserve appliquée aux fils produit le dessin au moment du tissage.'],
  ['Quel dispositif inca enregistrait des informations avec des cordelettes nouées ?', 'Le quipu', 'Le tocapu', 'Le kero', 'Le tupu', 'Les quipus combinaient position, couleur et types de nœuds pour coder surtout des données numériques.'],
  ['Quelle culture autochtone du nord-ouest américain érige des mâts sculptés ?', 'Les peuples de la côte nord-ouest', 'Les Pueblos', 'Les Inuits', 'Les Séminoles', 'Les mâts héraldiques racontent lignages, droits et récits familiaux ; ils ne sont pas des objets de culte.'],
  ['Quel peuple inuit sculptait de petites figures dans l’ivoire, l’os et la pierre ?', 'Les Inuits', 'Les Haïdas', 'Les Hopis', 'Les Navajos', 'La sculpture inuit représente animaux, chasseurs et êtres spirituels dans des matériaux arctiques.'],
  ['Quel art textile des Navajos est devenu célèbre pour ses couvertures et tapis géométriques ?', 'Le tissage navajo', 'Le patchwork seminole', 'Le finger weaving cree', 'Le tissage chilkat', 'Les tisserandes navajos développèrent des styles régionaux après l’introduction du mouton par les Espagnols.'],
  ['Quelle forme de peinture aborigène australienne représente des récits du Temps du Rêve ?', 'La peinture du désert central', 'La peinture barkcloth polynésienne', 'Le batik javanais', 'La peinture rupestre san', 'À Papunya, des artistes transposèrent dès 1971 des motifs rituels sur panneaux et toiles.'],
  ['Quel support traditionnel les artistes de Terre d’Arnhem utilisent-ils pour peindre ?', 'L’écorce d’eucalyptus', 'Le papier de mûrier', 'La soie', 'Le parchemin', 'Les peintures sur écorce de Terre d’Arnhem utilisent souvent des pigments naturels et des hachures croisées.'],
  ['Quel peuple maori sculpte les maisons de réunion appelées wharenui ?', 'Les Maoris', 'Les Samoans', 'Les Tongiens', 'Les Fidjiens', 'Les éléments sculptés du wharenui représentent souvent des ancêtres et l’histoire du groupe.'],
  ['Quel terme maori désigne le tatouage traditionnel du visage et du corps ?', 'Tā moko', 'Tapa', 'Malagan', 'Hei tiki', 'Le tā moko inscrit identité, statut et généalogie au moyen de motifs propres à chaque personne.'],
  ['Quel tissu d’écorce décoré est répandu dans plusieurs cultures polynésiennes ?', 'Le tapa', 'Le kente', 'Le batik', 'Le kilim', 'Le tapa est fabriqué en battant l’écorce interne du mûrier à papier puis en la peignant ou l’imprimant.'],
  ['Quelle tradition de Nouvelle-Irlande crée des sculptures ajourées pour des cérémonies funéraires ?', 'Le malagan', 'Le bisj', 'Le korwar', 'Le moai', 'Les sculptures malagan sont présentées lors de cérémonies puis souvent abandonnées ou détruites.'],
  ['Sur quelle île polynésienne se dressent les statues monumentales moai ?', 'Rapa Nui', 'Tahiti', 'Savai’i', 'Tongatapu', 'La plupart des moai furent sculptés dans le tuf volcanique de la carrière de Rano Raraku.'],
  ['Quel ancien art vietnamien est célèbre pour ses tambours en bronze ornés ?', 'La culture de Đông Sơn', 'La culture de Sa Huỳnh', 'La culture d’Óc Eo', 'La culture de Hòa Bình', 'Les tambours de Đông Sơn portent des motifs géométriques, bateaux, oiseaux et scènes cérémonielles.'],
  ['Quel art coréen produit des céramiques céladon incrustées de motifs blancs et noirs ?', 'Le céladon de Goryeo', 'La porcelaine Joseon blanche', 'La poterie Buncheong', 'La faïence Silla', 'Les potiers de Goryeo perfectionnèrent la technique d’incrustation sanggam aux XIIe et XIIIe siècles.'],
];

function rotate(values: string[], offset: number): string[] {
  return values.map((_, index) => values[(index + offset) % values.length]);
}

export const ART_ADULTE_EDITORIAL_06: Question[] = FACTS.map(
  ([question, answer, d1, d2, d3, explanation], index) => {
    const options = rotate([answer, d1, d2, d3], index % 4);
    return {
      id: `art_adulte_editorial_06_${String(index + 1).padStart(3, '0')}`,
      categoryId: 'art',
      question,
      options,
      correctAnswerIndex: options.indexOf(answer),
      difficulty: 'adulte',
      explanation,
    };
  },
);

