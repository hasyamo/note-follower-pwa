// グラフ描画モジュール
const ChartManager = {
  followersChart: null,
  changeChart: null,

  // 色設定
  colors: {
    accent: '#00b86b',
    accentLight: 'rgba(0, 184, 107, 0.2)',
    positive: '#22c55e',
    negative: '#ef4444',
    text: '#94a3b8',
    grid: '#334155'
  },

  // グラフを初期化
  init() {
    // Chart.jsのデフォルト設定
    Chart.defaults.color = this.colors.text;
    Chart.defaults.borderColor = this.colors.grid;
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  },

  // フォロワー推移グラフを描画
  renderFollowersChart(records) {
    const ctx = document.getElementById('followers-chart');
    if (!ctx) return;

    // 既存のチャートを破棄
    if (this.followersChart) {
      this.followersChart.destroy();
    }

    const labels = records.map(r => this.formatDateLabel(r.date));
    const data = records.map(r => r.followers);

    this.followersChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'フォロワー数',
          data: data,
          borderColor: this.colors.accent,
          backgroundColor: this.colors.accentLight,
          fill: true,
          tension: 0.3,
          pointRadius: records.length <= 30 ? 4 : 2,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  return records[items[0].dataIndex].date;
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              maxTicksLimit: 7
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: this.colors.grid
            },
            ticks: {
              precision: 0
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  },

  // 日次増減グラフを描画
  renderChangeChart(records) {
    const ctx = document.getElementById('change-chart');
    if (!ctx) return;

    // 既存のチャートを破棄
    if (this.changeChart) {
      this.changeChart.destroy();
    }

    // 最初のレコード以外を使用（changeが意味を持つもの）
    const displayRecords = records.slice(1);
    if (displayRecords.length === 0) {
      // データがない場合は空のチャートを表示
      displayRecords.push({ date: records[0]?.date || '', change: 0 });
    }

    const labels = displayRecords.map(r => this.formatDateLabel(r.date));
    const data = displayRecords.map(r => r.change);
    const colors = data.map(v => v >= 0 ? this.colors.positive : this.colors.negative);

    this.changeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '増減',
          data: data,
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  return displayRecords[items[0].dataIndex].date;
                }
                return '';
              },
              label: (item) => {
                const value = item.raw;
                const prefix = value > 0 ? '+' : '';
                return `${prefix}${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 0,
              maxTicksLimit: 7
            }
          },
          y: {
            grid: {
              color: this.colors.grid
            },
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  },

  // 日付ラベルをフォーマット (MM/DD)
  formatDateLabel(dateString) {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
  },

  // 両方のグラフを更新
  updateCharts(records) {
    this.renderFollowersChart(records);
    this.renderChangeChart(records);
  }
};
