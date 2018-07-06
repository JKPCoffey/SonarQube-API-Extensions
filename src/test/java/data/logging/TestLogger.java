package data.logging;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;

import org.junit.Assert;

public class TestLogger 
{
	private static final String RESOURCE_ROOT = "./src/test/resources/logs/";
	private File file;
	
	public TestLogger(Class<?> testClass)
	{
		String filename = testClass.getSimpleName().replaceAll("Test", "");
		file = new File(RESOURCE_ROOT + filename + "/" + filename + "Log.txt");
		
		if(!(file.exists()) || file.delete())
		{
			try 
			{
				file.getParentFile().mkdirs();
				file.createNewFile();
			} 
			catch (IOException e1) 
			{
				e1.printStackTrace();
				Assert.fail("Failed to create file.");
			}
		}
	}
	
	public Writer getMethodLogger(String method)
	{
		Writer writer = null;
		
		try 
		{
			writer = new FileWriter(file, true);
			writer.append(method + ":\n");
		} 
		catch (IOException e) 
		{
			Assert.fail("Failed to create writer.");
		}
		
		return writer;
	}
}
