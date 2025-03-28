

import Stripe from "stripe";
import { createClient }  from "@supabase/supabase-js"

import { Database } from "@/database.types";
import { Price, Product } from "@/types"

import { stripe } from "./stripe";
import { toDateTime } from "./helpers";

export const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const upSertProductRecord = async (product: Stripe.Product) => {
    const productData: Product = {
        id: product.id,
        active: product.active,
        name: product.name,
        description: product.description ?? undefined,
        image: product.images?.[0] ?? null,
        metadata: product.metadata
    }

    const { error } = await supabaseAdmin 
       .from('products')
       .upsert([productData])

       if(error) { 
        throw error
       }
       console.log(`Product inserted/updated: ${product.id}`)
}

const upsertPriceRecord = async (price: Stripe.Price) => {
    const priceData: Price = {
        id: price.id,
        product_id: typeof price.product === 'string' ? price.product : '',
        currency: price.currency,
        description: price.nickname ?? undefined,
        type: price.type,
        unit_amount: price.unit_amount ?? undefined,
        interval_count: price.recurring?.interval_count,
        trial_period_days: price.recurring?.trial_period_days,
        metadata: price.metadata
    }

    const { error } = await supabaseAdmin
      .from('prices')
      .upsert([priceData]);

      if(error) {
        throw error
      }

      console.log(`price inserted/updated: ${price.id}`)
}

const createOrRetrieveCustomer = async ({
    email,
    uuid
}: {
    email: string,
    uuid: string
}) => {
    const { data, error } = await supabaseAdmin
     .from('customers')
     .select('stripe_customer_id')
     .eq('id', uuid)
     .single();

     if(error || !data?.stripe_customer_id) {
        const customerData: { metadata: {supabaseUUID: string}; email?: string } = {
            metadata: {
                supabaseUUID: uuid
            }
        }

        if(email) customerData.email = email;

        const customer = await stripe.customers.create(customerData)
        const { error: supabaseError } = await supabaseAdmin
            .from('customers')
            .insert([{ id: uuid, stripe_customer_id: customer.id }])

            if(supabaseError) {
                throw supabaseError
            }

            console.log(`New customer created and inserted for ${uuid}`)
            return customer.id
     }

    return data.stripe_customer_id 
}

const copyBillingDetailsToCustomer = async (
    uuid: string,
    payment_method: Stripe.PaymentMethod
) => {
    const customer = payment_method.customer as string;
    const { name, phone, address } = payment_method.billing_details;
    if(!name || !phone || !address) return
     
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await stripe.customers.update(customer, { name, phone, address });
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        billing_address: {...address },
        payment_method: { ...payment_method[payment_method.type] }
      })
      .eq('id', uuid)

      if(error) throw error
}

const manageSubscriptionStatusChange = async (
    subscriptionId: string,
    customerId: string,
    createAction = false
) => {
   const { data: customerData, error: noCustomerError } = await supabaseAdmin
     .from('customers')
     .select('id')
     .eq('stripe_customer_id', customerId)
     .single()

     if(noCustomerError) throw noCustomerError

     const { id: uuid } = customerData!

     const Subscription = await stripe.subscriptions.retrieve(
        subscriptionId,
        {
            expand: ["default_payment_method"]
        }
     )

     const subscriptionData: Database["public"]["Tables"]["subscriptions"]["Insert"] =
       {
         id: Subscription.id,
         user_id: uuid,
         metadata: Subscription.metadata,
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         // @ts-expect-error
         status: Subscription.status,
         price_id: Subscription.items.data[0].price.id,
         cancel_at_period_end: Subscription.cancel_at_period_end,
         cancel_at: Subscription.cancel_at
           ? toDateTime(Subscription.cancel_at).toISOString()
           : null,
         canceled_at: Subscription.canceled_at
           ? toDateTime(Subscription.canceled_at).toISOString()
           : null,
         current_period_start: toDateTime(
           Subscription.current_period_start
         ).toISOString(),
         current_period_end: toDateTime(
           Subscription.current_period_end
         ).toISOString(),
         created: toDateTime(Subscription.created).toISOString(),
         ended_at: Subscription.ended_at
           ? toDateTime(Subscription.ended_at).toISOString()
           : null,
         trial_start: Subscription.trial_start
           ? toDateTime(Subscription.trial_start).toISOString()
           : null,
         trial_end: Subscription.trial_end
           ? toDateTime(Subscription.trial_end).toISOString()
           : null,
       };

       const { error } = await supabaseAdmin 
         .from('subscriptions')
         .upsert([subscriptionData])

         if(error) throw error;

         console.log(`Inserted / Updated subscription [${Subscription.id} for ${uuid}]`)

        if(createAction && Subscription.default_payment_method && uuid) {
            await copyBillingDetailsToCustomer(
                uuid,
                Subscription.default_payment_method as Stripe.PaymentMethod
            )
        }
}
   
export {
    upSertProductRecord,
    upsertPriceRecord,
    createOrRetrieveCustomer,
    manageSubscriptionStatusChange,
}