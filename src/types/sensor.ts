export interface SensorData {
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  lastUpdate: string | null;
  status: 'connected' | 'error' | 'connecting';
  error?: string;
}

export interface HistoricalEntry {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  // Plant parameters
  stemA_height?: number;
  stemA_maturedFlowers?: number;
  stemA_openBuds?: number;
  stemA_unopenedBuds?: number;
  stemA_diseases?: string;
  stemB_height?: number;
  stemB_maturedFlowers?: number;
  stemB_openBuds?: number;
  stemB_unopenedBuds?: number;
  stemB_diseases?: string;
  stemC_height?: number;
  stemC_maturedFlowers?: number;
  stemC_openBuds?: number;
  stemC_unopenedBuds?: number;
  stemC_diseases?: string;
  stemD_height?: number;
  stemD_maturedFlowers?: number;
  stemD_openBuds?: number;
  stemD_unopenedBuds?: number;
  stemD_diseases?: string;
  totalMaturedFlowers?: number;
  totalOpenBuds?: number;
  totalUnopenedBuds?: number;
  overallPlantHealth?: string;
  // Nutrient parameters
  masterblend_total?: number;
  masterblend_lastAdded?: string;
  calciumNitrate_total?: number;
  calciumNitrate_lastAdded?: string;
  magnesiumSulfate_total?: number;
  magnesiumSulfate_lastAdded?: string;
  phUp_total?: number;
  phUp_lastAdded?: string;
  phDown_total?: number;
  phDown_lastAdded?: string;
  water_total?: number;
  water_lastAdded?: string;
}