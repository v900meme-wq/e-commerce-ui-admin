import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../lib/api';

// ==================== CATEGORIES ====================
export function Categories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ categoryName: '', slug: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const response = await api.get('/categories');
        setCategories(response.data);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.patch(`/categories/${editId}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            setShowModal(false);
            setFormData({ categoryName: '', slug: '' });
            setEditId(null);
            fetchCategories();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (cat: any) => {
        setEditId(cat.id);
        setFormData({ categoryName: cat.categoryName, slug: cat.slug });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Xóa danh mục?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => { setShowModal(true); setEditId(null); setFormData({ categoryName: '', slug: '' }); }} className="btn-primary flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Thêm danh mục</span>
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên danh mục</th>
                            <th>Slug</th>
                            <th>Số sản phẩm</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td className="font-medium">{cat.categoryName}</td>
                                <td className="text-admin-600">{cat.slug}</td>
                                <td>{cat._count?.products || 0}</td>
                                <td>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">{editId ? 'Sửa' : 'Thêm'} danh mục</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Tên danh mục</label>
                                <input required value={formData.categoryName} onChange={(e) => setFormData({ categoryName: e.target.value, slug: generateSlug(e.target.value) })} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Slug</label>
                                <input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field" />
                            </div>
                            <div className="flex space-x-3">
                                <button type="submit" className="btn-primary flex-1">Lưu</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== ORDERS ====================
export function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const response = await api.get('/orders');
        setOrders(response.data);
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const statusColors: any = {
        pending: 'badge-warning',
        confirmed: 'badge-info',
        shipping: 'badge-info',
        delivered: 'badge-success',
        cancelled: 'badge-danger',
    };

    return (
        <div className="space-y-6">
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày đặt</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="font-medium">#{order.id}</td>
                                <td>{order.user.email}</td>
                                <td className="font-semibold">{formatPrice(order.totalAmount)}</td>
                                <td><span className={`badge ${statusColors[order.status]}`}>{order.status}</span></td>
                                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">Đơn hàng #{selectedOrder.id}</h3>
                                <p className="text-sm text-admin-600">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-admin-500 hover:text-admin-700">×</button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-admin-600">Khách hàng</p>
                                    <p className="font-medium">{selectedOrder.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-admin-600">Số điện thoại</p>
                                    <p className="font-medium">{selectedOrder.phone}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-admin-600">Địa chỉ</p>
                                    <p className="font-medium">{selectedOrder.address}</p>
                                </div>
                                {selectedOrder.note && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-admin-600">Ghi chú</p>
                                        <p className="font-medium">{selectedOrder.note}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-admin-600 mb-2">Trạng thái</p>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                    className="input-field"
                                >
                                    <option value="pending">Chờ xác nhận</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="shipping">Đang giao</option>
                                    <option value="delivered">Đã giao</option>
                                    <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>

                            <div className="border-t pt-4">
                                <p className="font-semibold mb-3">Sản phẩm</p>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.productName} x {item.quantity}</span>
                                            <span className="font-semibold">{formatPrice(Number(item.price) * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary-600">{formatPrice(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== USERS ====================
export function Users() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await api.get('/users');
        setUsers(response.data);
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.patch(`/users/${id}/toggle-status`);
            fetchUsers();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const toggleAdmin = async (id: number) => {
        if (!confirm('Thay đổi quyền admin?')) return;
        try {
            await api.patch(`/users/${id}/toggle-admin`);
            fetchUsers();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    return (
        <div className="space-y-6">
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Quyền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td className="font-medium">{user.email}</td>
                                <td>
                                    {user.isAdmin ? (
                                        <span className="badge bg-purple-100 text-purple-800">Admin</span>
                                    ) : (
                                        <span className="badge bg-gray-100 text-gray-800">User</span>
                                    )}
                                </td>
                                <td>
                                    {user.status ? (
                                        <span className="badge badge-success">Hoạt động</span>
                                    ) : (
                                        <span className="badge badge-danger">Đã khóa</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => toggleStatus(user.id)} className={`px-3 py-1 text-xs rounded ${user.status ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {user.status ? 'Khóa' : 'Mở'}
                                        </button>
                                        <button onClick={() => toggleAdmin(user.id)} className="px-3 py-1 text-xs rounded bg-purple-100 text-purple-700">
                                            {user.isAdmin ? 'Hủy admin' : 'Cấp admin'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}