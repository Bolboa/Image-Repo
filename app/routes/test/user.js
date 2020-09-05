const cases = [
	[`${__dirname}/resources/test.pdf`, 'application/pdf', 'john_test', 400],
	[`${__dirname}/resources/test.zip`, 'application/zip', 'bob_test', 200],
	[`${__dirname}/resources/test.png`, 'image/png', 'sara_test', 200]
];

const userStatusTest = (request) => describe('Image Upload Status With Multiple Users', () => {
	test.each(cases)(
		'Image path %p and content type %p as arguments for user %p, returns %p',
		async (image, contentType, user, status) => {
			const data = await request
				.post('/api/documents/upload?user=' + user)
				.attach('test', image, { contentType: contentType });
			await expect(data.status).toBe(status);
		}
	);
});

module.exports = userStatusTest;