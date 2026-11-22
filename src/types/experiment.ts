import type { ExperimentRecord } from '@cirnet/contracts/dto'
export type { ExperimentCreateV2 as ExperimentInput } from '@cirnet/contracts/dto'
export type Experiment = ExperimentRecord
export type ExperimentState = 'idle' | ExperimentRecord['state']
