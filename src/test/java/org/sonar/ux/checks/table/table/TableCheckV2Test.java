package org.sonar.ux.checks.table.table;

import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.factory.UXCheckFactory;

import data.checks.Check;

import java.io.File;


public class TableCheckV2Test 
{
	Check check = UXCheckFactory.getInstance(TableCheck.class);
	
	private static final String RESOURCES_PATH = "./src/test/resources/";
	
	@Test
	public void tableFileTest() 
	{
		File tableFile = new File(RESOURCES_PATH + "checks/table/settings/flyoutChecks/TableWithoutFlyout.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, tableFile);
		
		verifier
		.next()
		.withMessage(check.getCheckMessages()[2])
		.noMore();
	}

	@Test
	public void createJobError()
	{
		File file = new File(RESOURCES_PATH + "bulk-config/regions/createjoberror/CreateJobError.js");
	
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		verifier
		.next()
		.withMessage(check.getCheckMessages()[0]);
	}
	
	@Test
	public void tableSettingsBulkConfig()
	{
		File file = new File(RESOURCES_PATH + "bulk-config/widgets/tablesetting/TableSetting.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(check, file);
		
		verifier
		.next()
		.withMessage(check.getCheckMessages()[1])
		.noMore();
	}
}
