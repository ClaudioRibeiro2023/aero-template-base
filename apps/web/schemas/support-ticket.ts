/**
 * Re-export from @template/shared for backward compatibility.
 * Canonical source: packages/shared/src/schemas/support-ticket.ts
 */
export {
  TicketStatusEnum,
  TicketPriorityEnum,
  TicketCategoryEnum,
  MessageTypeEnum,
  ticketCreateSchema,
  ticketUpdateSchema,
  ticketAssignSchema,
  ticketRateSchema,
  messageCreateSchema,
  type TicketCreateFormValues,
  type TicketUpdateFormValues,
  type TicketAssignFormValues,
  type TicketRateFormValues,
  type MessageCreateFormValues,
} from '@template/shared/schemas'
