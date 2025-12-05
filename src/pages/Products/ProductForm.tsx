import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import api from '../../lib/api';
import TiptapEditor from '../../components/TiptapEditor';

interface Category {
    id: number;
    categoryName: string;
}

interface ImageData {
    imageUrl: string;
    altText: string;
    sortOrder: number;
}

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ImageData[]>([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        stockQuantity: '',
        description: '',
        status: 'active',
        slug: '',
        categoryId: '',
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            const product = response.data;
            setFormData({
                productName: product.productName,
                price: product.price,
                stockQuantity: product.stockQuantity,
                description: product.description,
                status: product.status,
                slug: product.slug,
                categoryId: product.categoryId,
            });
            setImages(product.images.map((img: any) => ({
                imageUrl: img.imageUrl,
                altText: img.altText || '',
                sortOrder: img.sortOrder,
            })));
            const thumbIndex = product.images.findIndex((img: any) => img.isThumbnail);
            setThumbnailIndex(thumbIndex >= 0 ? thumbIndex : 0);
        } catch (error) {
            alert('Lỗi tải sản phẩm');
            navigate('/products');
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleProductNameChange = (name: string) => {
        setFormData({
            ...formData,
            productName: name,
            slug: generateSlug(name),
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const response = await api.post('/upload/product-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return {
                    imageUrl: response.data.url,
                    altText: '',
                    sortOrder: images.length,
                };
            });

            const newImages = await Promise.all(uploadPromises);
            setImages([...images, ...newImages]);
        } catch (error) {
            alert('Lỗi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        if (thumbnailIndex === index) {
            setThumbnailIndex(0);
        } else if (thumbnailIndex > index) {
            setThumbnailIndex(thumbnailIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            alert('Vui lòng upload ít nhất 1 ảnh');
            return;
        }

        try {
            setLoading(true);
            const data = {
                ...formData,
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                categoryId: Number(formData.categoryId),
                images,
                thumbnailIndex,
            };

            if (isEdit) {
                await api.patch(`/products/${id}`, data);
                alert('Cập nhật thành công!');
            } else {
                await api.post('/products', data);
                alert('Tạo sản phẩm thành công!');
            }
            navigate('/products');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/products')}
                    className="text-admin-600 hover:text-admin-900"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6 space-y-4">
                            <div>
                                <label className="label">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productName}
                                    onChange={(e) => handleProductNameChange(e.target.value)}
                                    className="input-field"
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </div>

                            <div>
                                <label className="label">Slug *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="input-field"
                                    placeholder="slug-san-pham"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Giá (VND) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-field"
                                        placeholder="100000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Tồn kho *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="input-field"
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Mô tả sản phẩm *</label>
                                <TiptapEditor
                                    content={formData.description}
                                    onChange={(content) => setFormData({ ...formData, description: content })}
                                />
                            </div>
                        </div>

                        <div className="card p-6">
                            <label className="label">Hình ảnh sản phẩm *</label>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-admin-300 rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer inline-flex flex-col items-center"
                                    >
                                        <Upload className="w-12 h-12 text-admin-400 mb-2" />
                                        <span className="text-sm text-admin-600">
                                            {uploading ? 'Đang upload...' : 'Click để chọn ảnh'}
                                        </span>
                                        <span className="text-xs text-admin-500 mt-1">
                                            PNG, JPG, WEBP (tối đa 5MB)
                                        </span>
                                    </label>
                                </div>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {images.map((img, index) => (
                                            <div
                                                key={index}
                                                className={`relative group border-2 rounded-lg overflow-hidden ${thumbnailIndex === index ? 'border-primary-600' : 'border-admin-200'
                                                    }`}
                                            >
                                                <img
                                                    src={`http://localhost:3004${img.imageUrl}`}
                                                    alt=""
                                                    className="w-full aspect-square object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-lg"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {thumbnailIndex === index && (
                                                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                                                        Ảnh đại diện
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setThumbnailIndex(index)}
                                                    className="absolute bottom-2 left-2 bg-white text-xs px-2 py-1 rounded shadow"
                                                >
                                                    Đặt làm ảnh đại diện
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card p-6 space-y-4">
                            <div>
                                <label className="label">Danh mục *</label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Trạng thái *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="active">Hiện</option>
                                    <option value="inactive">Ẩn</option>
                                </select>
                            </div>
                        </div>

                        <div className="card p-6 space-y-4">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/products')}
                                className="btn-outline w-full"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}