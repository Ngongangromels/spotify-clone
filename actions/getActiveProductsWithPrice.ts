import { ProductWithPrice,  } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getActiveProductsWithPrice = async (): Promise<ProductWithPrice[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies,
  });

  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('price.active', true)
    .order('metadat->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error);
  }

  return (data) || [];
};

export default getActiveProductsWithPrice