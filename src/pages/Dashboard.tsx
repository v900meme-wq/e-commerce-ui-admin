import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../lib/api';

interface Stats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: any[];
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [products, orders, users] = await Promise.all([
                api.get('/products'),
                api.get('/orders'),
                api.get('/users'),
            ]);

            const totalRevenue = orders.data.reduce(
                (sum: number, order: any) => sum + Number(order.totalAmount),
                0
            );

            setStats({
                totalProducts: products.data.meta?.total || products.data.data?.length || 0,
                totalOrders: orders.data.length,
                totalUsers: users.data.length,
                totalRevenue,
                recentOrders: orders.data.slice(0, 5),
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const statCards = [
        {
            title: 'Tổng sản phẩm',
            value: stats.totalProducts,
            icon: Package,
            color: 'bg-blue-500',
            change: '+12%',
            positive: true,
        },
        {
            title: 'Đơn hàng',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-green-500',
            change: '+8%',
            positive: true,
        },
        {
            title: 'Người dùng',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-purple-500',
            change: '+23%',
            positive: true,
        },
        {
            title: 'Doanh thu',
            value: formatPrice(stats.totalRevenue),
            icon: DollarSign,
            color: 'bg-primary-500',
            change: '+15%',
            positive: true,
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-20 bg-admin-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-admin-600 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-admin-900">
                                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        {stat.positive ? (
                                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                                        )}
                                        <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-admin-500 ml-1">vs tháng trước</span>
                                    </div>
                                </div>
                                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-admin-900 mb-4">Đơn hàng gần đây</h3>
                {stats.recentOrders.length === 0 ? (
                    <p className="text-admin-500 text-center py-8">Chưa có đơn hàng nào</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đặt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td className="font-medium">#{order.id}</td>
                                        <td>{order.user.email}</td>
                                        <td className="font-semibold">{formatPrice(order.totalAmount)}</td>
                                        <td>
                                            <span className={`badge ${order.status === 'delivered' ? 'badge-success' :
                                                    order.status === 'cancelled' ? 'badge-danger' :
                                                        order.status === 'shipping' ? 'badge-info' :
                                                            'badge-warning'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <Package className="w-8 h-8 text-primary-600 mb-3" />
                    <h4 className="font-semibold text-admin-900 mb-2">Thêm sản phẩm mới</h4>
                    <p className="text-sm text-admin-600">Tạo sản phẩm mới cho cửa hàng</p>
                </div>
                <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <ShoppingCart className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-semibold text-admin-900 mb-2">Quản lý đơn hàng</h4>
                    <p className="text-sm text-admin-600">Xem và xử lý đơn hàng</p>
                </div>
                <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <Users className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-semibold text-admin-900 mb-2">Quản lý người dùng</h4>
                    <p className="text-sm text-admin-600">Xem danh sách người dùng</p>
                </div>
            </div>
        </div>
    );
}