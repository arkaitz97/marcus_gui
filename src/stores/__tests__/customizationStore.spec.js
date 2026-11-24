import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../services/apiService', () => ({
  default: {
    validateSelection: vi.fn(),
    calculatePrice: vi.fn(),
    createOrder: vi.fn(),
  },
}))

import apiService from '../../services/apiService'
import { useCustomizationStore } from '../customizationStore'

describe('customizationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    apiService.validateSelection.mockResolvedValue({ data: { valid: true, errors: [] } })
    apiService.calculatePrice.mockResolvedValue({ data: { total_price: '165.0' } })
  })

  it('stores one option per part and drops empty slots from the selection', () => {
    const store = useCustomizationStore()

    store.selectOption(1, 10)
    store.selectOption(2, 20)
    store.selectOption(1, 11)

    expect(store.selectedOptions).toEqual({ 1: 11, 2: 20 })
    expect(store.selectedOptionIds).toEqual([11, 20])
  })

  it('validates and prices the selection through the API on every change', async () => {
    const store = useCustomizationStore()

    store.selectOption(1, 10)

    expect(store.isValidating).toBe(true)
    await vi.waitFor(() => expect(store.isCalculatingPrice).toBe(false))
    expect(apiService.validateSelection).toHaveBeenCalledWith([10])
    expect(apiService.calculatePrice).toHaveBeenCalledWith([10])
    expect(store.isValidSelection).toBe(true)
    expect(store.validationErrors).toEqual([])
    expect(store.calculatedPrice).toBe('165.0')
  })

  it('does not price an empty selection and clears the price', async () => {
    const store = useCustomizationStore()

    await store.calculateCurrentPrice()

    expect(store.calculatedPrice).toBeNull()
    expect(apiService.calculatePrice).not.toHaveBeenCalled()
  })

  it('keeps the errors reported by the backend', async () => {    apiService.validateSelection.mockResolvedValue({
      data: { valid: false, errors: ["Option 'Mountain wheels' conflicts with 'Diamond'."] },
    })
    const store = useCustomizationStore()

    store.selectOption(1, 30)

    await vi.waitFor(() => expect(store.isValidating).toBe(false))
    expect(store.isValidSelection).toBe(false)
    expect(store.validationErrors).toHaveLength(1)
  })

  it('marks the selection invalid when the validation call fails', async () => {
    apiService.validateSelection.mockRejectedValue(new Error('offline'))
    const store = useCustomizationStore()

    store.selectOption(1, 10)

    await vi.waitFor(() => expect(store.isValidating).toBe(false))
    expect(store.isValidSelection).toBe(false)
    expect(store.validationErrors).toEqual(['Failed to validate selection. Please try again.'])
  })

  it('resets selection, validation and price state', async () => {
    const store = useCustomizationStore()
    store.selectOption(1, 10)
    await vi.waitFor(() => expect(store.calculatedPrice).toBe('165.0'))

    store.resetCustomization()

    expect(store.selectedOptions).toEqual({})
    expect(store.selectedOptionIds).toEqual([])
    expect(store.calculatedPrice).toBeNull()
    expect(store.isValidSelection).toBe(true)
  })

  it('places an order only for a valid non-empty selection', async () => {
    apiService.createOrder.mockResolvedValue({ data: { id: 7, status: 'pending' } })
    const store = useCustomizationStore()
    store.updateCustomerDetail('name', 'Ane')
    store.updateCustomerDetail('email', 'ane@example.com')
    store.selectOption(1, 10)
    await vi.waitFor(() => expect(store.isCalculatingPrice).toBe(false))

    const order = await store.placeOrder()

    expect(order.id).toBe(7)
    expect(apiService.createOrder).toHaveBeenCalledWith({
      order: {
        customer_name: 'Ane',
        customer_email: 'ane@example.com',
        selected_part_option_ids: [10],
      },
    })
  })

  it('returns null instead of ordering an invalid selection', async () => {
    const store = useCustomizationStore()
    store.isValidSelection = false

    expect(await store.placeOrder()).toBeNull()
    expect(apiService.createOrder).not.toHaveBeenCalled()
  })
})
