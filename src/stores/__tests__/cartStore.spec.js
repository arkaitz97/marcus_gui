import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../services/apiService', () => ({
  default: {
    createOrder: vi.fn(),
  },
}))

import apiService from '../../services/apiService'
import { useCartStore } from '../cartStore'

const configuredBike = {
  productId: 1,
  productName: 'Custom Bicycle',
  selectedOptionIds: [10, 20],
  price: '165.00',
}

describe('cartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts empty', () => {
    const cart = useCartStore()

    expect(cart.getCartItems).toEqual([])
    expect(cart.cartItemCount).toBe(0)
    expect(cart.cartTotalPrice).toBe(0)
  })

  it('adds a configured bike and sums the prices', () => {
    const cart = useCartStore()

    cart.addItemToCart(configuredBike)
    cart.addItemToCart({ ...configuredBike, price: '35.50' })

    expect(cart.cartItemCount).toBe(2)
    expect(cart.cartTotalPrice).toBeCloseTo(200.5)
    expect(cart.getCartItems[0].selectedOptionIds).toEqual([10, 20])
    expect(cart.getCartItems[0].id).toMatch(/^cartItem_/)
  })

  it('ignores a configuration without product or options', () => {
    const cart = useCartStore()

    cart.addItemToCart({ ...configuredBike, productId: null })
    cart.addItemToCart({ ...configuredBike, selectedOptionIds: [] })
    cart.addItemToCart({ ...configuredBike, price: undefined })

    expect(cart.cartItemCount).toBe(0)
  })

  it('removes one item by its generated id and keeps the rest', () => {
    const cart = useCartStore()
    cart.addItemToCart(configuredBike)
    cart.addItemToCart(configuredBike)

    cart.removeItemFromCart(cart.getCartItems[0].id)

    expect(cart.cartItemCount).toBe(1)
  })

  it('clears the cart', () => {
    const cart = useCartStore()
    cart.addItemToCart(configuredBike)

    cart.clearCart()

    expect(cart.getCartItems).toEqual([])
  })

  it('places one order per item and empties the cart when all succeed', async () => {
    apiService.createOrder.mockResolvedValue({ data: { id: 1, status: 'pending' } })
    const cart = useCartStore()
    cart.addItemToCart(configuredBike)

    const result = await cart.placeOrderFromCart({ name: 'Ane', email: 'ane@example.com' })

    expect(result.success).toBe(true)
    expect(apiService.createOrder).toHaveBeenCalledTimes(1)
    expect(apiService.createOrder.mock.calls[0][0].order).toEqual({
      customer_name: 'Ane',
      customer_email: 'ane@example.com',
      selected_part_option_ids: [10, 20],
    })
    expect(cart.cartItemCount).toBe(0)
  })

  it('keeps the cart when an order fails', async () => {
    apiService.createOrder.mockRejectedValue(new Error('network down'))
    const cart = useCartStore()
    cart.addItemToCart(configuredBike)

    const result = await cart.placeOrderFromCart({ name: 'Ane', email: 'ane@example.com' })

    expect(result.success).toBe(false)
    expect(cart.cartItemCount).toBe(1)
  })

  it('refuses to order with an empty cart or missing customer details', async () => {
    const cart = useCartStore()

    expect((await cart.placeOrderFromCart({ name: 'Ane', email: 'ane@example.com' })).success).toBe(false)

    cart.addItemToCart(configuredBike)
    expect((await cart.placeOrderFromCart({ name: 'Ane' })).success).toBe(false)
    expect(apiService.createOrder).not.toHaveBeenCalled()
  })
})
