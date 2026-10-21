import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#1f1b16]">แก้ไขสินค้า</h1>
      <div className="mt-6">
        <ProductForm productId={id} />
      </div>
    </div>
  );
}
