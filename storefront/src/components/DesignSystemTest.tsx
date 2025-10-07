/**
 * Test component to verify Yello Solar Hub design system integration
 */
const DesignSystemTest = () => {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-yello-500">
                Yello Solar Hub Design System Test
            </h1>

            <div className="bg-gradient-yello p-4 rounded-lg text-white">
                Gradient Background Test
            </div>

            <div className="text-gradient-yello text-xl font-bold">
                Gradient Text Test
            </div>

            <button className="ysh-btn-primary">
                Primary Button Test
            </button>

            <div className="ysh-card p-4">
                <h3 className="text-lg font-semibold">Card Test</h3>
                <p className="text-gray-600">Testing Yello design system integration</p>
            </div>
        </div>
    );
};

export default DesignSystemTest;