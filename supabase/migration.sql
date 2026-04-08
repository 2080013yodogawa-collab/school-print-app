-- おたよりカレンダー: 家族共有用テーブル

-- 家族テーブル
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 子どもテーブル
CREATE TABLE children (
  id TEXT NOT NULL,
  family_code VARCHAR(6) NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, family_code)
);

-- プリント記録テーブル
CREATE TABLE records (
  id TEXT NOT NULL,
  family_code VARCHAR(6) NOT NULL REFERENCES families(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  result JSONB NOT NULL,
  child_id TEXT,
  PRIMARY KEY (id, family_code)
);

-- インデックス
CREATE INDEX idx_children_family ON children(family_code);
CREATE INDEX idx_records_family ON records(family_code);
CREATE INDEX idx_records_child ON records(family_code, child_id);

-- RLS（Row Level Security）を有効化
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーがfamily codeで操作できるポリシー
CREATE POLICY "Anyone can create families" ON families FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read families by code" ON families FOR SELECT USING (true);

CREATE POLICY "Anyone can manage children by family code" ON children FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can manage records by family code" ON records FOR ALL USING (true) WITH CHECK (true);
