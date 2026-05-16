import { Card, ScreenScroll } from '../components/ui';
import { FoodItem, expiryTone } from '../data';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Clock, Award } from 'lucide-react';

export function Insights({ pantry }: { pantry: FoodItem[] }) {
  const totalItems = pantry.length;
  const expiringSoon = pantry.filter((i) => i.expiresInDays <= 5).length;
  const expired = pantry.filter((i) => i.expiresInDays <= 0).length;
  const lowStock = pantry.filter((i) => i.lowStock).length;

  const categoryData = pantry.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value], idx) => ({ id: `cat-${idx}`, name, value }))
    .sort((a, b) => b.value - a.value);

  const locationData = pantry.reduce((acc, item) => {
    acc[item.location] = (acc[item.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationChartData = [
    { id: 'loc-0', name: 'Pantry', value: locationData.pantry || 0, color: 'var(--pp-pantry-green)' },
    { id: 'loc-1', name: 'Fridge', value: locationData.fridge || 0, color: 'var(--pp-fresh-mint)' },
    { id: 'loc-2', name: 'Freezer', value: locationData.freezer || 0, color: 'var(--pp-soft-sage)' },
  ];

  const expiryBuckets = [
    { id: 'exp-0', name: 'Expired', value: expired, color: 'var(--pp-tomato-red)' },
    { id: 'exp-1', name: '1-2 days', value: pantry.filter((i) => i.expiresInDays > 0 && i.expiresInDays <= 2).length, color: 'var(--pp-expiry-urgent)' },
    { id: 'exp-2', name: '3-5 days', value: pantry.filter((i) => i.expiresInDays > 2 && i.expiresInDays <= 5).length, color: 'var(--pp-lemon-yellow)' },
    { id: 'exp-3', name: '6-14 days', value: pantry.filter((i) => i.expiresInDays > 5 && i.expiresInDays <= 14).length, color: 'var(--pp-expiry-ok)' },
    { id: 'exp-4', name: '15+ days', value: pantry.filter((i) => i.expiresInDays > 14).length, color: 'var(--pp-pantry-green)' },
  ].filter((b) => b.value > 0);

  const mostCommonCategory = categoryChartData[0]?.name ?? 'N/A';
  const avgExpiryDays = totalItems > 0
    ? Math.round(pantry.reduce((sum, i) => sum + i.expiresInDays, 0) / totalItems)
    : 0;

  const COLORS = [
    'var(--pp-chart-1)',
    'var(--pp-chart-2)',
    'var(--pp-chart-3)',
    'var(--pp-chart-4)',
    'var(--pp-chart-5)',
    'var(--pp-chart-6)',
  ];

  return (
    <ScreenScroll>
      <div className="pp-h3" style={{ marginBottom: 4 }}>Pantry Insights</div>
      <div className="pp-body" style={{ color: 'var(--pp-gray-600)' }}>
        Track your inventory and reduce food waste
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Package size={16} color="var(--pp-pantry-green)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Total Items</div>
          </div>
          <div className="pp-h2" style={{ fontSize: 32 }}>{totalItems}</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={16} color="var(--pp-tomato-red)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Expiring Soon</div>
          </div>
          <div className="pp-h2" style={{ fontSize: 32, color: expiringSoon > 0 ? 'var(--pp-tomato-red)' : 'var(--pp-gray-900)' }}>
            {expiringSoon}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Clock size={16} color="var(--pp-gray-600)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Avg. Expiry</div>
          </div>
          <div className="pp-card-title" style={{ fontSize: 20 }}>{avgExpiryDays} days</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Award size={16} color="var(--pp-pantry-green)" />
            <div className="pp-small" style={{ color: 'var(--pp-gray-600)' }}>Top Category</div>
          </div>
          <div className="pp-card-title" style={{ fontSize: 16 }}>{mostCommonCategory}</div>
        </Card>
      </div>

      {expiringSoon > 0 && (
        <Card style={{ background: 'var(--pp-red-soft)', borderColor: 'var(--pp-tomato-red)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--pp-radius-full)',
                background: 'var(--pp-tomato-red)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="pp-strong" style={{ color: 'var(--pp-tomato-red)' }}>
                Action Needed
              </div>
              <div className="pp-body" style={{ marginTop: 4, color: 'var(--pp-gray-800)' }}>
                You have {expiringSoon} item{expiringSoon === 1 ? '' : 's'} expiring in the next 5 days.
                {expired > 0 && ` ${expired} already expired.`} Check the Meals tab for recipes.
              </div>
            </div>
          </div>
        </Card>
      )}

      <div>
        <div className="pp-h4" style={{ marginBottom: 12 }}>Expiration Timeline</div>
        <Card>
          <ResponsiveContainer width="100%" height={200} key="expiry-timeline-container">
            <BarChart data={expiryBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fontFamily: 'var(--pp-font)', fill: 'var(--pp-gray-700)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: 'var(--pp-font)', fill: 'var(--pp-gray-700)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--pp-gray-900)',
                  border: 'none',
                  borderRadius: 'var(--pp-radius-md)',
                  fontSize: 14,
                  fontFamily: 'var(--pp-font)',
                  color: 'white',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {expiryBuckets.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div className="pp-h4" style={{ marginBottom: 12 }}>By Location</div>
          <Card>
            <ResponsiveContainer width="100%" height={180} key="location-pie-container">
              <PieChart>
                <Pie
                  data={locationChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {locationChartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--pp-gray-900)',
                    border: 'none',
                    borderRadius: 'var(--pp-radius-md)',
                    fontSize: 14,
                    fontFamily: 'var(--pp-font)',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              {locationChartData.map((loc) => (
                <div
                  key={loc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 'var(--pp-radius-sm)',
                        background: loc.color,
                      }}
                    />
                    <span className="pp-small">{loc.name}</span>
                  </div>
                  <span className="pp-small" style={{ fontWeight: 600 }}>{loc.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div className="pp-h4" style={{ marginBottom: 12 }}>By Category</div>
          <Card>
            <ResponsiveContainer width="100%" height={180} key="category-pie-container">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--pp-gray-900)',
                    border: 'none',
                    borderRadius: 'var(--pp-radius-md)',
                    fontSize: 14,
                    fontFamily: 'var(--pp-font)',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8, maxHeight: 100, overflowY: 'auto' }}>
              {categoryChartData.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 'var(--pp-radius-sm)',
                        background: COLORS[idx % COLORS.length],
                      }}
                    />
                    <span className="pp-small">{cat.name}</span>
                  </div>
                  <span className="pp-small" style={{ fontWeight: 600 }}>{cat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div className="pp-h4" style={{ marginBottom: 12 }}>Smart Suggestions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {expiringSoon > 0 && (
            <Card style={{ background: 'var(--pp-warm-cream)', borderColor: 'var(--pp-lemon-yellow)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ fontSize: 24 }}>🍳</div>
                <div style={{ flex: 1 }}>
                  <div className="pp-strong">Cook with expiring items</div>
                  <div className="pp-small" style={{ marginTop: 2 }}>
                    Check Meals for recipes using items expiring soon
                  </div>
                </div>
              </div>
            </Card>
          )}
          {lowStock > 0 && (
            <Card style={{ background: 'var(--pp-soft-sage)', borderColor: 'var(--pp-fresh-mint)' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ fontSize: 24 }}>🛒</div>
                <div style={{ flex: 1 }}>
                  <div className="pp-strong">Restock low items</div>
                  <div className="pp-small" style={{ marginTop: 2 }}>
                    {lowStock} item{lowStock === 1 ? ' is' : 's are'} running low. Add to grocery list?
                  </div>
                </div>
              </div>
            </Card>
          )}
          {categoryChartData.length > 0 && categoryChartData[0].value > totalItems * 0.4 && (
            <Card>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ fontSize: 24 }}>📊</div>
                <div style={{ flex: 1 }}>
                  <div className="pp-strong">Diversify your pantry</div>
                  <div className="pp-small" style={{ marginTop: 2 }}>
                    {mostCommonCategory} makes up {Math.round((categoryChartData[0].value / totalItems) * 100)}% of your
                    pantry. Try adding more variety!
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ScreenScroll>
  );
}
