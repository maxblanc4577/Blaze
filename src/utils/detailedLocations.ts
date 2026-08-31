export interface LocationItem {
  id: string;
  country: string;
  region: string;
  type: 'City' | 'Town' | 'Village' | 'Parish';
  name: string;
}

export const DETAILED_LOCATIONS: LocationItem[] = [
  // Jamaica Parishes
  { id: 'jm_p_kingston', country: 'Jamaica', region: 'Surrey', type: 'Parish', name: 'Kingston Parish' },
  { id: 'jm_p_standrew', country: 'Jamaica', region: 'Surrey', type: 'Parish', name: 'Saint Andrew Parish' },
  { id: 'jm_p_portland', country: 'Jamaica', region: 'Surrey', type: 'Parish', name: 'Portland Parish' },
  { id: 'jm_p_stthomas', country: 'Jamaica', region: 'Surrey', type: 'Parish', name: 'Saint Thomas Parish' },
  { id: 'jm_p_stcatherine', country: 'Jamaica', region: 'Middlesex', type: 'Parish', name: 'Saint Catherine Parish' },
  { id: 'jm_p_clarendon', country: 'Jamaica', region: 'Middlesex', type: 'Parish', name: 'Clarendon Parish' },
  { id: 'jm_p_manchester', country: 'Jamaica', region: 'Middlesex', type: 'Parish', name: 'Manchester Parish' },
  { id: 'jm_p_stelizabeth', country: 'Jamaica', region: 'Middlesex', type: 'Parish', name: 'Saint Elizabeth Parish' },
  { id: 'jm_p_stann', country: 'Jamaica', region: 'Middlesex', type: 'Parish', name: 'Saint Ann Parish' },
  { id: 'jm_p_trelawny', country: 'Jamaica', region: 'Cornwall', type: 'Parish', name: 'Trelawny Parish' },
  { id: 'jm_p_stjames', country: 'Jamaica', region: 'Cornwall', type: 'Parish', name: 'Saint James Parish' },
  { id: 'jm_p_hanover', country: 'Jamaica', region: 'Cornwall', type: 'Parish', name: 'Hanover Parish' },
  { id: 'jm_p_westmoreland', country: 'Jamaica', region: 'Cornwall', type: 'Parish', name: 'Westmoreland Parish' },

  // Barbados Parishes
  { id: 'bb_p_christchurch', country: 'Barbados', region: 'Christ Church', type: 'Parish', name: 'Christ Church Parish' },
  { id: 'bb_p_standrew', country: 'Barbados', region: 'Saint Andrew', type: 'Parish', name: 'Saint Andrew Parish' },
  { id: 'bb_p_stgeorge', country: 'Barbados', region: 'Saint George', type: 'Parish', name: 'Saint George Parish' },
  { id: 'bb_p_stjames', country: 'Barbados', region: 'Saint James', type: 'Parish', name: 'Saint James Parish' },
  { id: 'bb_p_stjohn', country: 'Barbados', region: 'Saint John', type: 'Parish', name: 'Saint John Parish' },
  { id: 'bb_p_stjoseph', country: 'Barbados', region: 'Saint Joseph', type: 'Parish', name: 'Saint Joseph Parish' },
  { id: 'bb_p_stlucy', country: 'Barbados', region: 'Saint Lucy', type: 'Parish', name: 'Saint Lucy Parish' },
  { id: 'bb_p_stmichael', country: 'Barbados', region: 'Saint Michael', type: 'Parish', name: 'Saint Michael Parish' },
  { id: 'bb_p_stpeter', country: 'Barbados', region: 'Saint Peter', type: 'Parish', name: 'Saint Peter Parish' },
  { id: 'bb_p_stphilip', country: 'Barbados', region: 'Saint Philip', type: 'Parish', name: 'Saint Philip Parish' },
  { id: 'bb_p_stthomas', country: 'Barbados', region: 'Saint Thomas', type: 'Parish', name: 'Saint Thomas Parish' },

  // Dominica Parishes
  { id: 'dm_p_standrew', country: 'Dominica', region: 'Saint Andrew', type: 'Parish', name: 'Saint Andrew Parish' },
  { id: 'dm_p_stdavid', country: 'Dominica', region: 'Saint David', type: 'Parish', name: 'Saint David Parish' },
  { id: 'dm_p_stgeorge', country: 'Dominica', region: 'Saint George', type: 'Parish', name: 'Saint George Parish' },
  { id: 'dm_p_stjohn', country: 'Dominica', region: 'Saint John', type: 'Parish', name: 'Saint John Parish' },
  { id: 'dm_p_stjoseph', country: 'Dominica', region: 'Saint Joseph', type: 'Parish', name: 'Saint Joseph Parish' },
  { id: 'dm_p_stluke', country: 'Dominica', region: 'Saint Luke', type: 'Parish', name: 'Saint Luke Parish' },
  { id: 'dm_p_stmark', country: 'Dominica', region: 'Saint Mark', type: 'Parish', name: 'Saint Mark Parish' },
  { id: 'dm_p_stpatrick', country: 'Dominica', region: 'Saint Patrick', type: 'Parish', name: 'Saint Patrick Parish' },
  { id: 'dm_p_stpaul', country: 'Dominica', region: 'Saint Paul', type: 'Parish', name: 'Saint Paul Parish' },
  { id: 'dm_p_stpeter', country: 'Dominica', region: 'Saint Peter', type: 'Parish', name: 'Saint Peter Parish' },

  // Grenada Parishes
  { id: 'gd_p_standrew', country: 'Grenada', region: 'Saint Andrew', type: 'Parish', name: 'Saint Andrew Parish' },
  { id: 'gd_p_stdavid', country: 'Grenada', region: 'Saint David', type: 'Parish', name: 'Saint David Parish' },
  { id: 'gd_p_stgeorge', country: 'Grenada', region: 'Saint George', type: 'Parish', name: 'Saint George Parish' },
  { id: 'gd_p_stjohn', country: 'Grenada', region: 'Saint John', type: 'Parish', name: 'Saint John Parish' },
  { id: 'gd_p_stmark', country: 'Grenada', region: 'Saint Mark', type: 'Parish', name: 'Saint Mark Parish' },
  { id: 'gd_p_stpatrick', country: 'Grenada', region: 'Saint Patrick', type: 'Parish', name: 'Saint Patrick Parish' },
  { id: 'gd_p_carriacou', country: 'Grenada', region: 'Carriacou & Petite Martinique', type: 'Parish', name: 'Carriacou Dependency' },

  // Saint Vincent and the Grenadines Parishes
  { id: 'vc_p_charlotte', country: 'Saint Vincent and the Grenadines', region: 'Charlotte', type: 'Parish', name: 'Charlotte Parish' },
  { id: 'vc_p_standrew', country: 'Saint Vincent and the Grenadines', region: 'Saint Andrew', type: 'Parish', name: 'Saint Andrew Parish' },
  { id: 'vc_p_stdavid', country: 'Saint Vincent and the Grenadines', region: 'Saint David', type: 'Parish', name: 'Saint David Parish' },
  { id: 'vc_p_stgeorge', country: 'Saint Vincent and the Grenadines', region: 'Saint George', type: 'Parish', name: 'Saint George Parish' },
  { id: 'vc_p_stpatrick', country: 'Saint Vincent and the Grenadines', region: 'Saint Patrick', type: 'Parish', name: 'Saint Patrick Parish' },
  { id: 'vc_p_grenadines', country: 'Saint Vincent and the Grenadines', region: 'Grenadines', type: 'Parish', name: 'Grenadines Parish' },

  // Antigua and Barbuda Parishes
  { id: 'ag_p_stgeorge', country: 'Antigua and Barbuda', region: 'Saint George', type: 'Parish', name: 'Saint George Parish' },
  { id: 'ag_p_stjohn', country: 'Antigua and Barbuda', region: 'Saint John', type: 'Parish', name: 'Saint John Parish' },
  { id: 'ag_p_stmary', country: 'Antigua and Barbuda', region: 'Saint Mary', type: 'Parish', name: 'Saint Mary Parish' },
  { id: 'ag_p_stpaul', country: 'Antigua and Barbuda', region: 'Saint Paul', type: 'Parish', name: 'Saint Paul Parish' },
  { id: 'ag_p_stpeter', country: 'Antigua and Barbuda', region: 'Saint Peter', type: 'Parish', name: 'Saint Peter Parish' },
  { id: 'ag_p_stphilip', country: 'Antigua and Barbuda', region: 'Saint Philip', type: 'Parish', name: 'Saint Philip Parish' },
  { id: 'ag_p_barbuda', country: 'Antigua and Barbuda', region: 'Barbuda', type: 'Parish', name: 'Barbuda Dependency' },

  // Saint Kitts and Nevis Parishes
  { id: 'kn_p_christchurch', country: 'Saint Kitts and Nevis', region: 'Christ Church Nichola Town', type: 'Parish', name: 'Christ Church Nichola Town Parish' },
  { id: 'kn_p_stanne', country: 'Saint Kitts and Nevis', region: 'Saint Anne Sandy Point', type: 'Parish', name: 'Saint Anne Sandy Point Parish' },
  { id: 'kn_p_stgeorge', country: 'Saint Kitts and Nevis', region: 'Saint George Basseterre', type: 'Parish', name: 'Saint George Basseterre Parish' },
  { id: 'kn_p_stjohn', country: 'Saint Kitts and Nevis', region: 'Saint John Capisterre', type: 'Parish', name: 'Saint John Capisterre Parish' },
  { id: 'kn_p_stmary', country: 'Saint Kitts and Nevis', region: 'Saint Mary Cayon', type: 'Parish', name: 'Saint Mary Cayon Parish' },
  { id: 'kn_p_stpaul', country: 'Saint Kitts and Nevis', region: 'Saint Paul Capisterre', type: 'Parish', name: 'Saint Paul Capisterre Parish' },
  { id: 'kn_p_stpeter', country: 'Saint Kitts and Nevis', region: 'Saint Peter Basseterre', type: 'Parish', name: 'Saint Peter Basseterre Parish' },
  { id: 'kn_p_stthomas', country: 'Saint Kitts and Nevis', region: 'Saint Thomas Middle Island', type: 'Parish', name: 'Saint Thomas Middle Island Parish' },

  // Cuba - Cities, Towns, Villages
  { id: 'cu_havana', country: 'Cuba', region: 'Havana', type: 'City', name: 'Havana' },
  { id: 'cu_santiago', country: 'Cuba', region: 'Santiago de Cuba', type: 'City', name: 'Santiago de Cuba' },
  { id: 'cu_varadero', country: 'Cuba', region: 'Matanzas', type: 'Town', name: 'Varadero' },
  { id: 'cu_trinidad', country: 'Cuba', region: 'Sancti Spíritus', type: 'Town', name: 'Trinidad de Cuba' },
  { id: 'cu_vinales', country: 'Cuba', region: 'Pinar del Río', type: 'Village', name: 'Viñales Village' },

  // Dominican Republic
  { id: 'dr_santo_domingo', country: 'Dominican Republic', region: 'National District', type: 'City', name: 'Santo Domingo' },
  { id: 'dr_punta_cana', country: 'Dominican Republic', region: 'La Altagracia', type: 'Town', name: 'Punta Cana' },
  { id: 'dr_las_terrenas', country: 'Dominican Republic', region: 'Samaná', type: 'Town', name: 'Las Terrenas' },
  { id: 'dr_cabarete', country: 'Dominican Republic', region: 'Puerto Plata', type: 'Village', name: 'Cabarete Village' },

  // Puerto Rico
  { id: 'pr_san_juan', country: 'Puerto Rico', region: 'San Juan', type: 'City', name: 'San Juan' },
  { id: 'pr_rincon', country: 'Puerto Rico', region: 'Rincón', type: 'Town', name: 'Rincón' },
  { id: 'pr_vieques', country: 'Puerto Rico', region: 'Vieques', type: 'Village', name: 'Isabel Segunda Village' },

  // Haiti
  { id: 'ht_port_au_prince', country: 'Haiti', region: 'Ouest', type: 'City', name: 'Port-au-Prince' },
  { id: 'ht_jacmel', country: 'Haiti', region: 'Sud-Est', type: 'Town', name: 'Jacmel' },

  // Bahamas
  { id: 'bs_nassau', country: 'Bahamas', region: 'New Providence', type: 'City', name: 'Nassau' },
  { id: 'bs_harbour_island', country: 'Bahamas', region: 'Eleuthera', type: 'Village', name: 'Dunmore Town Village' },

  // Canada & Worldwide
  { id: 'ca_toronto', country: 'Canada', region: 'Ontario', type: 'City', name: 'Toronto' },
  { id: 'ca_vancouver', country: 'Canada', region: 'British Columbia', type: 'City', name: 'Vancouver' },
  { id: 'mx_cdmx', country: 'Mexico', region: 'CDMX', type: 'City', name: 'Mexico City' },
  { id: 'br_rio', country: 'Brazil', region: 'Rio de Janeiro', type: 'City', name: 'Rio de Janeiro' }
];
