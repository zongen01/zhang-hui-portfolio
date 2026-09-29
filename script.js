'use strict';
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});
const defaults = { visitors: 2000, buyers: 40, orders: 50, revenue: 15000, adRevenue: 8000, spend: 2000 };
const fields = Object.keys(defaults);
function updateMetrics() {
  const data = Object.fromEntries(fields.map(id => [id, document.getElementById(id).valueAsNumber]));
  const valid = fields.every(id => Number.isFinite(data[id]) && data[id] >= 0) && ['visitors','buyers','orders'].every(id => Number.isInteger(data[id]));
  const consistent = data.buyers <= data.visitors && data.buyers <= data.orders && data.adRevenue <= data.revenue && !(data.orders === 0 && data.revenue > 0) && !(data.buyers === 0 && data.orders > 0);
  const message = document.getElementById('metric-message');
  let error = '';
  if (!valid) error = '请输入完整的非负数字；访客、买家和订单数量须为整数。';
  else if (!consistent) error = '请核对同周期数据：买家数不能超过访客数或订单数，广告归因收入不能超过总支付金额，有订单需有买家、有收入需有订单。';
  const show = (id, value) => { document.getElementById(id).value = error ? '—' : value; };
  show('conversion', data.visitors > 0 ? (data.buyers / data.visitors * 100).toFixed(2) + '%' : '—');
  show('aov', data.orders > 0 ? '¥' + (data.revenue / data.orders).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—');
  show('roas', data.spend > 0 ? (data.adRevenue / data.spend).toFixed(2) : '—');
  message.textContent = error || (data.visitors === 0 || data.orders === 0 || data.spend === 0 ? '分母为 0 的指标显示为“—”，不作除法计算。' : '需使用同一统计周期；ROAS 不等于利润率，广告收入需以平台归因口径为准。');
  message.classList.toggle('error', Boolean(error));
}
fields.forEach(id => document.getElementById(id).addEventListener('input', updateMetrics));
document.getElementById('metric-form').addEventListener('submit', event => event.preventDefault());
document.getElementById('reset').addEventListener('click', () => { fields.forEach(id => document.getElementById(id).value = defaults[id]); updateMetrics(); });
updateMetrics();
