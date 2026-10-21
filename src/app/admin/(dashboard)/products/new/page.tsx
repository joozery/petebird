import { ProductForm } from '../ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl text-[#302a22]">เพิ่มสินค้าใหม่</h1>
      <p className="mt-1 text-sm text-[#827b71]">กรอกข้อมูลสินค้าทั้ง 3 ภาษาให้ครบก่อนบันทึก</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
