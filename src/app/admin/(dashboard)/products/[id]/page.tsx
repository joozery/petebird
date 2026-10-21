import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl text-[#302a22]">แก้ไขสินค้า</h1>
      <div className="mt-6">
        <ProductForm productId={id} />
      </div>
    </div>
  );
}
