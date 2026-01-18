from concurrent.futures import ProcessPoolExecutor
import pandas as pd
import streamlit as st
from backend.file_operations import read_csv, save_output
from backend.filter_operations import filter_data, process_part_names
from backend.openai_operations import generate_severity, generate_control_prevention, generate_recommended_action

# Function to calculate RPN for a single row
def calculate_rpn(row):
    if pd.isna(row['rpn']):
        try:
            return int(row['sev']) * int(row['current design occur']) * int(row['current design - detection'])
        except Exception as e:
            return None
    else:
        return row['rpn']

# Function to parallelize severity generation
def generate_severity_parallel(function_df, severity_check_criteria):
    return generate_severity(function_df, severity_check_criteria)

# Function to parallelize control prevention generation
def generate_control_prevention_parallel(function_df):
    return generate_control_prevention(function_df)

# Function to parallelize recommended action generation
def generate_recommended_action_parallel(function_df):
    return generate_recommended_action(function_df)

def ui():
    # Streamlit UI Configuration
    st.set_page_config(page_title="PFMEA Filter", page_icon="📝", layout="wide")

    # Sidebar (Left Panel)
    st.sidebar.markdown(
        """
        <div style="text-align: center;">
            <h1 style="color:white;">( expleo )</h1>
            <p style="color:white; font-size: 14px;">Think bold, act reliable</p>
        </div>
        <hr>
        <h2 style="color:white; text-align:center;">PFMEA Analysis</h2>
        """,
        unsafe_allow_html=True
    )
 
    # Main UI Title
    st.markdown("<h3>PFMEA Analysis</h3>", unsafe_allow_html=True)
    
    # UI Fields (Titles in Boxes with Dropdowns in the Same Row)
    lcdv16 = st.selectbox("Select LCDV16", options=["1csasukrzfy0a0d0", "Others"])
    country = st.selectbox("Select Country", options=["India", "Italy"])
    plant = st.selectbox("Select Plant", options=["ps02"])
    model = st.selectbox("Select Model", options=["c3"])
    family_code = st.selectbox("Select Family Code", options=["c3_ ice", "c3_ icf"])
    workcenter = st.selectbox("Select Workcenter", options=["trim line-1", "power train assy"])

    # Upload Section
    mbom_file = st.file_uploader("Upload MBOM", type=["csv"])
   
    if mbom_file is not None:
        mbom_df = read_csv(mbom_file)
        st.write("Data from MBOM File:", mbom_df.head())

        # Filtering the data based on user selection
        filtered_data = filter_data(mbom_df, lcdv16, plant, model, family_code, workcenter)
        st.write("Filtered Data:", filtered_data.head())

        # Process part names and search in the second file
        second_file_path = r"/Users/meena/Desktop/EXPLEO/PFMEA /Base final/PFMEA_final/TCS-Auto_Process FMEA_FINAL - R7_updated.csv"
        final_df = process_part_names(filtered_data, second_file_path)
        st.write("Final Data:", final_df.head())

        # Load the severity check criteria
        Severity_check_Criteria = pd.read_csv('Siviarity_check_Criteria.csv')
        
        # Limit the DataFrame to the first 50 rows
        function_df = final_df[['functions', 'key steps', 'requirement', 'potential failure mode', 'potential effect(s) of failure']].head(15)
        
        # Identify rows with missing values
        missing_severity_df = final_df[final_df['sev'].isna() | final_df['current design occur'].isna() | final_df['current design - detection'].isna()]
        missing_control_prevention_df = final_df[final_df['current design - controls prevention'].isna()]
        missing_recommended_action_df = final_df[final_df['recommended action'].isna()]

        # Parallelizing generation tasks using ProcessPoolExecutor
        with ProcessPoolExecutor(max_workers=3) as executor:
            # Run all generation tasks concurrently
            severity_future = executor.submit(generate_severity_parallel, missing_severity_df, Severity_check_Criteria)
            control_prevention_future = executor.submit(generate_control_prevention_parallel, missing_control_prevention_df)
            recommended_action_future = executor.submit(generate_recommended_action_parallel, missing_recommended_action_df)
            
            # Collect results from all tasks
            severity_results = severity_future.result()
            control_prevention_results = control_prevention_future.result()
            recommended_action_results = recommended_action_future.result()
        
        # Assign the generated results to the corresponding rows
        for idx, result in zip(missing_severity_df.index, severity_results):
            if pd.isna(final_df.at[idx, 'sev']):
                final_df.at[idx, 'sev'] = result['severity']
            if pd.isna(final_df.at[idx, 'current design occur']):
                final_df.at[idx, 'current design occur'] = result['current design occur']
            if pd.isna(final_df.at[idx, 'current design - detection']):
                final_df.at[idx, 'current design - detection'] = result['current design - detection']

        for idx, result in zip(missing_control_prevention_df.index, control_prevention_results):
            if pd.isna(final_df.at[idx, 'current design - controls prevention']):
                final_df.at[idx, 'current design - controls prevention'] = result

        for idx, result in zip(missing_recommended_action_df.index, recommended_action_results):
            if pd.isna(final_df.at[idx, 'recommended action']):
                final_df.at[idx, 'recommended action'] = result

        # Calculate RPN (Risk Priority Number) for only the rows where it is missing (NaN)
        final_df['rpn'] = final_df.apply(
            lambda row: (
                int(row['sev']) if pd.notna(row['sev']) else 3
            ) * (
                int(row['current design occur']) if pd.notna(row['current design occur']) else 4
            ) * (
                int(row['current design - detection']) if pd.notna(row['current design - detection']) else 5
            ) if pd.isna(row['rpn']) else row['rpn'],
            axis=1
        )

        # Saving final data
        output_path = r"/Users/meena/Desktop/EXPLEO/PFMEA /Base final/PFMEA_final/outputf.csv"
        save_output(final_df, output_path)

        # Display and provide download option for the output
        st.write("Final Output Data:", final_df)
        st.download_button(
            label="Download Final Output CSV",
            data=final_df.to_csv(index=False),
            file_name="output.csv",
            mime="text/csv"
        )
