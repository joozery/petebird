import { ProductForm } from '../ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#1f1b16]">เพิ่มสินค้าใหม่</h1>
      <p className="mt-1 text-sm text-[#8a7f6d]">กรอกข้อมูลสินค้าทั้ง 3 ภาษาให้ครบก่อนบันทึก</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
