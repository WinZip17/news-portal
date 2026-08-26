/**
 * Единый переключатель инфраструктуры мониторинга.
 * monitoringEnabled: false — Prometheus и Grafana не поднимаются (экономия ресурсов на проде).
 * monitoringEnabled: true  — Prometheus и Grafana включаются при деплое и через npm run dev:infra.
 */
module.exports = {
  monitoringEnabled: false,
};
