import { ntpProtectedApiRoute } from '@/lib/protectedRoute';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!(await ntpProtectedApiRoute(req, res))) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

    // TODO: Implement formidable to handle file uploads from the client while staying secure and serverless
	return res.status(200).json({ message: 'Unimplemented' });
}
