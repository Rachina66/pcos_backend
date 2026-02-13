"""
PCOS Prediction Script
- Called by Node.js via child_process.spawn
- Reads JSON from stdin
- Outputs JSON to stdout
- Located at: FYP/predict.py
- Models at:  FYP/models/
"""

import sys
import json
import joblib
import pandas as pd
import os
import warnings
warnings.filterwarnings('ignore')


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_model():
    """Load model using absolute path"""
    try:
        model_path = os.path.join(BASE_DIR, 'models', 'pcos_model.joblib')
        features_path = os.path.join(BASE_DIR, 'models', 'model_features.joblib')

        model = joblib.load(model_path)
        features = joblib.load(features_path)
        return model, features

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Model loading failed: {str(e)}'
        }))
        sys.exit(1)


def make_prediction(input_data, model, features):
    """Make PCOS risk prediction"""
    try:
        # Create DataFrame with correct feature order
        input_df = pd.DataFrame([input_data], columns=features)

        # Convert all to numeric (all 16 features are numeric)
        for col in input_df.columns:
            input_df[col] = pd.to_numeric(input_df[col], errors='coerce')

        # Check for invalid values after conversion
        if input_df.isnull().any().any():
            null_cols = input_df.columns[input_df.isnull().any()].tolist()
            return {
                'success': False,
                'error': f'Invalid values in: {null_cols}'
            }

        # Improvement #3: Single model call (cleaner, slightly faster)
        proba = model.predict_proba(input_df)[0][1]
        prediction = int(proba >= 0.5)

        return {
            'success': True,
            'prediction': prediction,                # 0 or 1
            'probability': round(float(proba), 4),   # 0.0 to 1.0
            'risk_level': 'High Risk' if prediction == 1 else 'Low Risk',
            'confidence': round(float(proba) * 100, 2)  # percentage
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }


def main():
    try:
        # Read JSON input from Node.js stdin
        input_json = sys.stdin.read()

        # Parse JSON
        input_data = json.loads(input_json)

        # Load model and features
        model, features = load_model()

        # Make prediction
        result = make_prediction(input_data, model, features)

        # Send JSON result back to Node.js via stdout
        print(json.dumps(result))

    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON input: {str(e)}'
        }))
        sys.exit(1)

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Script error: {str(e)}'
        }))
        sys.exit(1)


if __name__ == '__main__':
    main()