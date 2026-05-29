import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Orbitron'] text-2xl font-bold text-[#E8EAF0]">ADD PRODUCT</h1>
        <p className="text-[#5A6478] font-['Rajdhani'] text-sm mt-1">Deploy a new item to the store</p>
      </div>
      <ProductForm />
    </div>
  )
}
