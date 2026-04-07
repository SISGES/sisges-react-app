import { api } from './api'

export interface GradingConfig {
  yearMaxPoints: number
  yearMinPercentage: number
  trimester1MaxPoints: number
  trimester1MinPercentage: number
  trimester1PointsProvas: number
  trimester1PointsAtividades: number
  trimester1PointsTrabalhos: number
  trimester2MaxPoints: number
  trimester2MinPercentage: number
  trimester2PointsProvas: number
  trimester2PointsAtividades: number
  trimester2PointsTrabalhos: number
  trimester3MaxPoints: number
  trimester3MinPercentage: number
  trimester3PointsProvas: number
  trimester3PointsAtividades: number
  trimester3PointsTrabalhos: number
}

export async function getGradingConfig(): Promise<GradingConfig> {
  return api.get<GradingConfig>('/grading-config')
}

export async function updateGradingConfig(data: GradingConfig): Promise<GradingConfig> {
  return api.put<GradingConfig>('/grading-config', data)
}
