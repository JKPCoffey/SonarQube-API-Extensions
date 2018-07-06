package data.domain.reader;

import static org.junit.Assert.*;

import java.io.IOException;
import java.io.Writer;

import org.junit.BeforeClass;
import org.junit.Test;

import data.logging.TestLogger;
import data.reader.RelationStreamAnalyser;
import data.reader.RelationStreamAnalyserFactory;

public class RelationFileReaderTest
{
	private static TestLogger logger;
	
	@BeforeClass
	public static void init()
	{
		logger = new TestLogger(RelationFileReaderTest.class);
	}
	
	
	
	@SuppressWarnings({ "unused", "unchecked" })
	@Test
	public void blankFileNameTest() 
	{
		try
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>)RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, "");
			
			fail();
		}
		
		catch(IOException invalidFile)
		{
			assertTrue(true);
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings({ "unused", "unchecked" })
	@Test
	public void blankFileTest()
	{
		try
		{
			String blankFilename = "";
			
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>)RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, blankFilename);
			
			fail();
		}
		
		catch(Exception invalidFile)
		{
			assertTrue(true);
		}
	}
	
	@SuppressWarnings({ "unused", "unchecked" })
	@Test
	public void invalidFileTypeTest()
	{
		try
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>)RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, "/data/domain/invalidFileType.txt");
			
			fail();
		}
		
		catch(IOException invalidFile)
		{
			assertTrue(true);
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings("unused")
	@Test
	public void invalidFileTest()
	{
		try
		{
			String invalidFilename = "/data/domain/invalidFileType.txt";
			
			RelationStreamAnalyser<?, ?> reader = 
			RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, invalidFilename);
			
			fail();
		}
		
		catch(IOException invalidFile)
		{
			assertTrue(true);
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void getDomainsFilenameTest()
	{
		try(Writer writer = logger.getMethodLogger("getDomainsFilenameTest"))
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, "/data/domain/validDomainFile.rel");
			
			String [] subdomains = reader.getKeys();
		
			assertTrue(subdomains.length > 0);
			
			writer.append("\tDomains from Filename:\n");
			for(String subdomain : subdomains)
			{
				writer.append("\t\t" + reader.getValue(subdomain) + "\n");
			}
			
			writer.append("\n");
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void getSubdomainsFilenameTest()
	{
		try(Writer writer = logger.getMethodLogger("getSubdomainsFilenameTest"))
		{
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, "/data/domain/validDomainFile.rel");
			
			String [] subdomains = reader.getKeys();
			
			writer.append("\tSubdomains from Filename:\n");
			for(String subdomain : subdomains)
			{
				writer.append("\t\t" + subdomain + "\n");
			}
			
			writer.append("\n");
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void getDomainsFileTest()
	{
		try(Writer writer = logger.getMethodLogger("getDomainsFileTest"))
		{
			String domainFilename = "/data/domain/validDomainFile.rel";
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, domainFilename);

			String [] subdomains = reader.getKeys();
			
			assertTrue(subdomains.length > 0);
			
			writer.append("\tDomains from File:\n");
			for(String subdomain : subdomains)
			{
				writer.append("\t\t" + reader.getValue(subdomain) + "\n");
			}
			
			writer.append("\n");
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void getSubdomainsFileTest()
	{
		try(Writer writer = logger.getMethodLogger("getSubdomainsFileTest"))
		{
			String subdomainFilename = "/data/domain/validDomainFile.rel";
			RelationStreamAnalyser<String, String> reader = 
			(RelationStreamAnalyser<String, String>) RelationStreamAnalyserFactory.getReader(RelationStreamAnalyserFactory.DOMAIN_SUBDOMAIN, subdomainFilename);

			String [] subdomains = reader.getKeys();
			
			writer.append("\tSubdomains from File:\n");
			for(String subdomain : subdomains)
			{
				writer.append("\t\t" + subdomain + "\n");
			}
			
			writer.append("\n");
		}
		
		catch(Exception e)
		{
			fail();
		}
	}
}
