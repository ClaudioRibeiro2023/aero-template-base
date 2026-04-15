export { OpenAIGateway } from './OpenAIGateway'
export type { IAIGateway } from '../types/gateway'

import { OpenAIGateway } from './OpenAIGateway'
import type { IAIGateway } from '../types/gateway'

// Singleton lazy — criado uma vez no processo
let _gateway: IAIGateway | null = null

export function getAIGateway(): IAIGateway {
  if (!_gateway) _gateway = new OpenAIGateway()
  return _gateway
}
