'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { kbService } from '@/lib/api/services';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Book, Search, Plus, Tag, BookOpen, ChevronRight, FileText, Globe, Lock } from 'lucide-react';
import { KnowledgeCategoryEnum, CreateArticleRequestModel, SearchArticleRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertMessages } from '@/lib/utils/AlertMessages';

const KnowledgeBasePage: React.FC = () => {
    const { user } = useAuth();

    const [articles, setArticles] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newArticle, setNewArticle] = useState<any>({
        title: '',
        category: KnowledgeCategoryEnum.OTHER,
        content: '',
        tags: '',
        isPublished: true
    });

    useEffect(() => {
        if (user?.companyId) {
            fetchStats();
            searchArticles();
        }
    }, [user?.companyId]);

    const fetchStats = async () => {
        try {
            const req = new CompanyIdRequestModel(user!.companyId);
            const res: any = await kbService.getStats(req);
            if (res && res.byCategory) {
                setStats(res);
            } else if (res && res.data && res.data.byCategory) {
                setStats(res.data);
            } else if (res && res.stats && res.stats.byCategory) {
                setStats(res.stats);
            } else {
                setStats(null);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to fetch statistics');
        }
    };

    const searchArticles = async () => {
        // setIsLoading(true);
        try {
            const req = new SearchArticleRequestModel();
            req.companyId = user!.companyId;
            req.query = searchQuery;
            req.category = selectedCategory ? selectedCategory as KnowledgeCategoryEnum : undefined;
            const res: any = await kbService.searchArticles(req);
            if (Array.isArray(res)) {
                setArticles(res);
            } else if (res && Array.isArray(res.data)) {
                setArticles(res.data);
            } else if (res && Array.isArray(res.articles)) {
                setArticles(res.articles);
            } else {
                setArticles([]);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to search articles');
        } finally {
            // No local loading needed
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const tagsArray = newArticle.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
            const req = new CreateArticleRequestModel();
            req.title = newArticle.title;
            req.content = newArticle.content;
            req.category = newArticle.category;
            req.tags = tagsArray;
            req.isPublished = newArticle.isPublished;
            req.authorId = user!.id;
            req.companyId = user!.companyId;

            const res = await kbService.createArticle(req);
            if (res.status) {
                AlertMessages.getSuccessMessage('Article created successfully');
                setIsCreateOpen(false);
                setNewArticle({ title: '', category: KnowledgeCategoryEnum.OTHER, content: '', tags: '', isPublished: true });
                searchArticles();
                fetchStats();
            } else {
                AlertMessages.getErrorMessage(res.message);
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message || 'Failed to create article');
        }
    };

    const categoryIcons: Record<string, any> = {
        [KnowledgeCategoryEnum.IT_POLICY]: Lock,
        [KnowledgeCategoryEnum.TROUBLESHOOTING]: Tag,
        [KnowledgeCategoryEnum.HOW_TO]: BookOpen,
        [KnowledgeCategoryEnum.SOFTWARE]: Globe,
        [KnowledgeCategoryEnum.HARDWARE]: FileText,
        [KnowledgeCategoryEnum.SECURITY]: Lock,
        [KnowledgeCategoryEnum.OTHER]: Book
    };

    return (
        <RouteGuard>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
                <PageHeader
                    title="Help Center"
                    description="Centralized repository for IT documentation, guides, and policies."
                    icon={<Book />}
                    gradient="from-cyan-500 to-blue-600"
                    actions={[
                        {
                            label: 'Write Article',
                            icon: <Plus className="w-4 h-4" />,
                            onClick: () => setIsCreateOpen(true),
                            variant: 'primary'
                        }
                    ]}
                />

                {/* Hero Search Section */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <h2 className="text-3xl font-black text-white mb-4 relative z-10">
                        How can we help you today?
                    </h2>
                    <div className="max-w-2xl mx-auto relative z-10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for answers, error codes, or guides..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all font-medium text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchArticles()}
                            />
                            <button
                                onClick={() => searchArticles()}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {stats && (
                        <div className="flex justify-center gap-8 mt-8 text-slate-300 relative z-10">
                            <div className="text-center">
                                <div className="text-2xl font-black text-white">{stats.total}</div>
                                <div className="text-xs font-bold uppercase tracking-wider">Articles</div>
                            </div>
                            {Object.entries(stats.byCategory).slice(0, 3).map(([cat, count]: any) => (
                                <div key={cat} className="text-center">
                                    <div className="text-2xl font-black text-white">{count}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider">{cat}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Categories & Results */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filter */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white px-2">Categories</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => { setSelectedCategory(''); searchArticles(); }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-white dark:bg-slate-900 shadow-md text-cyan-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Book className="w-4 h-4" />
                                    All Topics
                                </span>
                                {stats && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{stats.total}</span>}
                            </button>
                            {Object.values(KnowledgeCategoryEnum).map((cat) => {
                                const Icon = categoryIcons[cat] || Book;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); searchArticles(); }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-white dark:bg-slate-900 shadow-md text-cyan-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" />
                                            {cat.replace(/_/g, ' ')}
                                        </span>
                                        {stats && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{stats.byCategory[cat] || 0}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-4">
                        {articles.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No articles found</h3>
                                <p className="text-slate-500">Try adjusting your search or category filter.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {articles.map((article) => (
                                    <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-cyan-500">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                            {article.category}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {new Date(article.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {article.content.substring(0, 200)}...
                                                    </p>
                                                    {article.tags && article.tags.length > 0 && (
                                                        <div className="flex gap-2 pt-2">
                                                            {article.tags.map((tag: string, i: number) => (
                                                                <span key={i} className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 rounded-full">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button variant="ghost" className="text-slate-400 hover:text-cyan-600">
                                                    <ChevronRight className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Article Modal */}
                <Modal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    title="Create New Knowledge Article"
                    size="lg"
                >
                    <form onSubmit={handleCreate} className="space-y-6 p-6">
                        <Input
                            label="Article Title"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            required
                            placeholder="e.g. How to install VPN Certificate"
                        />

                        <Select
                            label="Category"
                            name="category"
                            value={newArticle.category}
                            onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                            options={Object.values(KnowledgeCategoryEnum).map(v => ({ value: v, label: v }))}
                            required
                        />

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Content (Markdown supported)
                            </label>
                            <textarea
                                className="w-full h-64 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono text-sm"
                                value={newArticle.content}
                                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                                required
                                placeholder="Write your article content here..."
                            />
                        </div>

                        <Input
                            label="Tags (comma separated)"
                            value={newArticle.tags}
                            onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                            placeholder="wifi, network, vpn"
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="primary">Publish Knowledge</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
}


export default KnowledgeBasePage;