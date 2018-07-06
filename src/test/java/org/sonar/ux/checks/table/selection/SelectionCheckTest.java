package org.sonar.ux.checks.table.selection;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sonar.javascript.checks.verifier.JavaScriptCheckVerifier;
import org.sonar.squidbridge.checks.CheckMessagesVerifier;
import org.sonar.ux.checks.factory.UXCheckFactory;

import data.checks.Check;
import data.logging.TestLogger;
import utilities.ExamplesFileFilter;

public class SelectionCheckTest 
{
	private Check selCheck = UXCheckFactory.getInstance(SelectionCheck.class);
	
	private static final String RESOURCE_PATH = "./src/test/resources/";
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(SelectionCheckTest.class);
	}
	
	@Test
	public void notATableFileTest() 
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/notATableFile.js");
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.noMore();
	}
	
	@Test
	public void simpleSelectionTableTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/simple-selection-table/src/simple-selection-table/widgets/user-table/UserTable.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.noMore();
	}
	
	@Test
	public void simpleTableTest()
	{
		File file = new File(RESOURCE_PATH + "table-examples/simple-table/src/simple-table/widgets/user-table/UserTable.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[3])
		.noMore();
	}
	
	@Test
	public void withoutCheckboxesTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/noCheckboxes.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[0])
		.noMore();
	}
	
	@Test
	public void onlyCheckboxesTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/onlyCheckboxes.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[2])
		.next()
		.withMessage(selCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void withoutMultiSelectionTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/noMultiSelect.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[2])
		.noMore();
	}
	
	@Test
	public void onlyMultiSelectionTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/onlyMultiSelect.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[0])
		.next()
		.withMessage(selCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void withoutSingleSelectionTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/noSingleSelect.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[1])
		.noMore();
	}
	
	@Test
	public void onlySingleSelectionTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/onlySingleSelect.js");

		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.next()
		.withMessage(selCheck.getCheckMessages()[0])
		.next()
		.withMessage(selCheck.getCheckMessages()[2])
		.noMore();
	}
	
	@Test
	public void virtualScrollingTableExampleTest()
	{
		File file = new File(RESOURCE_PATH + "checks/table/selection/VirtualScrollingTable.js");
		
		CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, file);
		
		verifier.noMore();
	}
	
	@Test
	public void allExamplesTest()
	{
		ArrayList<String> withDependency 	= new ArrayList<>(0);
		ArrayList<String> withoutDependency = new ArrayList<>(0);
		
		ArrayList<String> withCheckboxes 	= new ArrayList<>(0);
		ArrayList<String> withoutCheckboxes = new ArrayList<>(0);
		
		ArrayList<String> withSingle		= new ArrayList<>(0);
		ArrayList<String> withoutSingle		= new ArrayList<>(0);
		
		ArrayList<String> withMultiple		= new ArrayList<>(0);
		ArrayList<String> withoutMultiple	= new ArrayList<>(0);
		
		
		File examplesFolder = new File(RESOURCE_PATH + "table-examples/");
		File [] examples = examplesFolder.listFiles(new ExamplesFileFilter());
		
		for(File example : examples)
		{
			String exampleTablePath = String.format(RESOURCE_PATH + "table-examples/%s/src/%s/widgets/user-table/UserTable.js", example.getName(), example.getName());
			File exampleTable = new File(exampleTablePath);
			CheckMessagesVerifier verifier = JavaScriptCheckVerifier.issues(selCheck, exampleTable);
			
			try
			{
				verifier.next().withMessage(selCheck.getCheckMessages()[3]);
				withoutDependency.add(example.getName());
			}
			
			catch(AssertionError dependency)
			{
				withDependency.add(example.getName());
				
				try
				{
					verifier.next().withMessage(selCheck.getCheckMessages()[0]);
					withoutCheckboxes.add(example.getName());
				}
				
				catch(AssertionError checkboxes)
				{
					withCheckboxes.add(example.getName());
				}
				
				
				try
				{
					verifier.next().withMessage(selCheck.getCheckMessages()[1]);
					withoutMultiple.add(example.getName());
				}
				
				catch(AssertionError single)
				{
					withMultiple.add(example.getName());
				}
				
				try
				{
					verifier.next().withMessage(selCheck.getCheckMessages()[2]);
					withoutSingle.add(example.getName());
				}
				
				catch(AssertionError multiple)
				{
					withSingle.add(example.getName());
				}
			}
		}
		
		try(Writer writer = logger.getMethodLogger("allExamplesTest"))
		{
			writer.append("\tWith Dependency:\n");
			for(String dep : withDependency)
			{
				writer.append("\t\t" + dep + "\n");
			}
			
			writer.append("\n");
			
			writer.append("\tWithout Dependency:\n");
			for(String dep : withoutDependency)
			{
				writer.append("\t\t" + dep + "\n");
			}
			
			writer.append("\n");
			
			
			writer.append("\tWith Single Selection:\n");
			for(String single : withSingle)
			{
				writer.append("\t\t" + single + "\n");
			}
			
			writer.append("\n");

			writer.append("\tWithout Single Selection:\n");
			for(String single : withoutSingle)
			{
				writer.append("\t\t" + single + "\n");
			}
			
			writer.append("\n\n");
			

			writer.append("\tWith mulitple Selection:\n");
			for(String multi : withMultiple)
			{
				writer.append("\t\t" + multi + "\n");
			}
			
			writer.append("\n");

			writer.append("\tWithout Multiple Selection:\n");
			for(String multi : withoutMultiple)
			{
				writer.append("\t" + multi + "\n");
			}
			
			writer.append("\n\n");
			

			writer.append("\tWith Checkboxes:\n");
			for(String boxes : withCheckboxes)
			{
				writer.append("\t" + boxes + "\n");
			}
			
			writer.append("\n");

			writer.append("\tWithout Checkboxes:\n");
			for(String boxes : withoutCheckboxes)
			{
				writer.append("\t\t" + boxes + "\n");
			}
		}
		
		catch(IOException io)
		{
			Assert.fail();
		}
		
	}
}
