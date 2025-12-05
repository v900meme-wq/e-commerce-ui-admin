import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';

interface Product {
    id: number;
    productName: string;
    price: number;
    stockQuantity: number;
    status: string;
    slug: string;
    category: { categoryName: string };
    images: { imageUrl: string; isThumbnail: boolean }[];
}

export default function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;
            const response = await api.get('/products', { params });
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                </div>
                <Link to="/products/create" className="btn-primary flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Thêm sản phẩm</span>
                </Link>
            </div>

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-admin-500">Đang tải...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-admin-500">Không có sản phẩm nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Tồn kho</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const thumbnail = product.images.find(img => img.isThumbnail) || product.images[0];
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-admin-100">
                                                    {thumbnail ? (
                                                        <img
                                                            src={`http://localhost:3000${thumbnail.imageUrl}`}
                                                            alt={product.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-admin-400">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="font-medium">{product.productName}</td>
                                            <td>{product.category.categoryName}</td>
                                            <td className="font-semibold">{formatPrice(product.price)}</td>
                                            <td>{product.stockQuantity}</td>
                                            <td>
                                                {product.status === 'active' ? (
                                                    <span className="badge badge-success flex items-center space-x-1 w-fit">
                                                        <Eye className="w-3 h-3" />
                                                        <span>Hiện</span>
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-danger flex items-center space-x-1 w-fit">
                                                        <EyeOff className="w-3 h-3" />
                                                        <span>Ẩn</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/products/edit/${product.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}