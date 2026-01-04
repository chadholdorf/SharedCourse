import { getAllMatchRequests, getAllDinnerMatches } from '@/lib/actions/match-actions'

export default async function AdminOpsPage() {
  const requests = await getAllMatchRequests(50)
  const matches = await getAllDinnerMatches(50)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Match Requests */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Requests</h1>
          <p className="text-gray-600 mb-6">Latest 50 dinner match requests</p>

          {requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {req.member.fullName || 'Unknown'}
                        <br />
                        <span className="text-xs text-gray-500 font-mono">{req.member.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.region}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.timeWindow}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.partyType}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.matchPreference}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dinner Matches */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dinner Matches</h1>
          <p className="text-gray-600 mb-6">Latest 50 matches</p>

          {matches.length === 0 ? (
            <p className="text-gray-500">No matches yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person A</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person B</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirm A</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirm B</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(match.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {match.requestA.member.fullName || 'Unknown'}
                        <br />
                        <span className="text-xs text-gray-500 font-mono">{match.phoneA}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {match.requestB.member.fullName || 'Unknown'}
                        <br />
                        <span className="text-xs text-gray-500 font-mono">{match.phoneB}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{match.requestA.region}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {match.confirmAAt ? new Date(match.confirmAAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {match.confirmBAt ? new Date(match.confirmBAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
