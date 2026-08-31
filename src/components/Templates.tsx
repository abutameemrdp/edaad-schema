export const TEMPLATE_ICONS: Record<string, string> = {
  "E-Commerce": "🛒",
  "Blog": "📝",
  "Social Media": "📱",
  "LMS": "🏫",
};

interface Template {
  name: string;
  icon: string;
  description: string;
  tables: any[];
}

const TEMPLATES: Template[] = [
  {
    name: "E-Commerce",
    icon: "🛒",
    description: "متجر إلكتروني كامل",
    tables: [
      { tableName: "users", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "email", type: "VARCHAR" }, { name: "name", type: "VARCHAR" }, { name: "created_at", type: "TIMESTAMP" }], relations: [] },
      { tableName: "categories", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "name", type: "VARCHAR" }, { name: "slug", type: "VARCHAR" }], relations: [] },
      { tableName: "products", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "category_id", type: "UUID" }, { name: "title", type: "VARCHAR" }, { name: "price", type: "DECIMAL" }, { name: "stock", type: "INTEGER" }], relations: [{ targetTable: "categories" }] },
      { tableName: "orders", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "user_id", type: "UUID" }, { name: "total", type: "DECIMAL" }, { name: "status", type: "VARCHAR" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "users" }] },
      { tableName: "order_items", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "order_id", type: "UUID" }, { name: "product_id", type: "UUID" }, { name: "quantity", type: "INTEGER" }, { name: "price", type: "DECIMAL" }], relations: [{ targetTable: "orders" }, { targetTable: "products" }] }
    ]
  },
  {
    name: "Blog",
    icon: "📝",
    description: "مدونة مع التعليقات والتصنيفات",
    tables: [
      { tableName: "users", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "username", type: "VARCHAR" }, { name: "email", type: "VARCHAR" }, { name: "bio", type: "TEXT" }], relations: [] },
      { tableName: "tags", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "name", type: "VARCHAR" }, { name: "slug", type: "VARCHAR" }], relations: [] },
      { tableName: "posts", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "author_id", type: "UUID" }, { name: "title", type: "VARCHAR" }, { name: "content", type: "TEXT" }, { name: "published", type: "BOOLEAN" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "users" }] },
      { tableName: "comments", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "post_id", type: "UUID" }, { name: "user_id", type: "UUID" }, { name: "content", type: "TEXT" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "posts" }, { targetTable: "users" }] },
      { tableName: "post_tags", columns: [{ name: "post_id", type: "UUID" }, { name: "tag_id", type: "UUID" }], relations: [{ targetTable: "posts" }, { targetTable: "tags" }] }
    ]
  },
  {
    name: "Social Media",
    icon: "📱",
    description: "شبكة اجتماعية مع المتابعة والرسائل",
    tables: [
      { tableName: "users", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "username", type: "VARCHAR" }, { name: "email", type: "VARCHAR" }, { name: "avatar_url", type: "VARCHAR" }, { name: "created_at", type: "TIMESTAMP" }], relations: [] },
      { tableName: "posts", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "user_id", type: "UUID" }, { name: "content", type: "TEXT" }, { name: "image_url", type: "VARCHAR" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "users" }] },
      { tableName: "likes", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "user_id", type: "UUID" }, { name: "post_id", type: "UUID" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "users" }, { targetTable: "posts" }] },
      { tableName: "follows", columns: [{ name: "follower_id", type: "UUID" }, { name: "following_id", type: "UUID" }, { name: "created_at", type: "TIMESTAMP" }], relations: [{ targetTable: "users" }] },
      { tableName: "messages", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "sender_id", type: "UUID" }, { name: "receiver_id", type: "UUID" }, { name: "content", type: "TEXT" }, { name: "read", type: "BOOLEAN" }], relations: [{ targetTable: "users" }] }
    ]
  },
  {
    name: "LMS",
    icon: "🏫",
    description: "نظام تعليمي - دورات وطلاب",
    tables: [
      { tableName: "users", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "name", type: "VARCHAR" }, { name: "email", type: "VARCHAR" }, { name: "role", type: "VARCHAR" }], relations: [] },
      { tableName: "courses", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "instructor_id", type: "UUID" }, { name: "title", type: "VARCHAR" }, { name: "description", type: "TEXT" }, { name: "price", type: "DECIMAL" }], relations: [{ targetTable: "users" }] },
      { tableName: "lessons", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "course_id", type: "UUID" }, { name: "title", type: "VARCHAR" }, { name: "video_url", type: "VARCHAR" }, { name: "order", type: "INTEGER" }], relations: [{ targetTable: "courses" }] },
      { tableName: "enrollments", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "user_id", type: "UUID" }, { name: "course_id", type: "UUID" }, { name: "enrolled_at", type: "TIMESTAMP" }, { name: "completed", type: "BOOLEAN" }], relations: [{ targetTable: "users" }, { targetTable: "courses" }] },
      { tableName: "reviews", columns: [{ name: "id", type: "UUID", isPrimary: true }, { name: "student_id", type: "UUID" }, { name: "course_id", type: "UUID" }, { name: "rating", type: "INTEGER" }, { name: "comment", type: "TEXT" }], relations: [{ targetTable: "users" }, { targetTable: "courses" }] }
    ]
  }
];

interface TemplatesProps {
  onSelect: (tables: any[], name: string) => void;
  onClose: () => void;
}

export function Templates({ onSelect, onClose }: TemplatesProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass-panel templates-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 قوالب جاهزة</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="templates-grid">
          {TEMPLATES.map(t => (
            <button key={t.name} className="template-card" onClick={() => { onSelect(t.tables, t.name); onClose(); }}>
              <span className="template-icon">{t.icon}</span>
              <span className="template-name">{t.name}</span>
              <span className="template-desc">{t.description}</span>
              <span className="template-meta">{t.tables.length} جداول</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

