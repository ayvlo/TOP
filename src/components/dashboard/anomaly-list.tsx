import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface Anomaly {
  id: string;
  metric: string;
  severity: number;
  detectedAt: Date | string;
  explanation: string | null;
  status: string;
}

interface AnomalyListProps {
  anomalies: Anomaly[];
  orgId: string;
}

export default function AnomalyList({ anomalies, orgId }: AnomalyListProps) {
  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'text-red-500';
    if (severity >= 60) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getSeverityBg = (severity: number) => {
    if (severity >= 80) return 'bg-red-500/10 border-red-500/20';
    if (severity >= 60) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-yellow-500/10 border-yellow-500/20';
  };

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-ayvlo-text/50">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No anomalies detected</p>
            <p className="text-sm mt-2">Your metrics are looking good!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Anomalies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <Link
              key={anomaly.id}
              href={`/org/${orgId}/anomalies/${anomaly.id}`}
              className={`block p-4 rounded-lg border transition-colors hover:bg-ayvlo-accent/30 ${getSeverityBg(
                anomaly.severity
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(anomaly.severity)}`} />
                    <span className="font-medium truncate">{anomaly.metric}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${getSeverityColor(
                        anomaly.severity
                      )}`}
                    >
                      {anomaly.severity}
                    </span>
                  </div>
                  {anomaly.explanation && (
                    <p className="text-sm text-ayvlo-text/70 line-clamp-2">
                      {anomaly.explanation}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-ayvlo-text/50">
                    <span>{formatDateTime(anomaly.detectedAt)}</span>
                    <span className="capitalize">{anomaly.status.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-ayvlo-accent">
          <Link
            href={`/org/${orgId}/anomalies`}
            className="text-sm text-ayvlo-blue hover:underline"
          >
            View all anomalies →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
